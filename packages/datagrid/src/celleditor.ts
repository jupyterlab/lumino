/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2019, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import {
  IDisposable
} from '@lumino/disposable';

import {
  DataGrid
} from './datagrid';

import {
  SelectionModel
} from './selectionmodel';

import {
  getKeyboardLayout
} from '@lumino/keyboard';

import {
  Signal
} from '@lumino/signaling';

export
interface ICellInputValidatorResponse {
  valid: boolean;
  message?: string;
}

export
interface ICellInputValidator {
  validate(cell: CellEditor.CellConfig, value: any): ICellInputValidatorResponse;
}

export
interface ICellEditResponse {
  cell: CellEditor.CellConfig;
  value: any;
  cursorMovement: SelectionModel.CursorMoveDirection;
}

export
interface ICellEditor {
  edit(cell: CellEditor.CellConfig, options?: ICellEditOptions): void;
  cancel(): void;
}

const DEFAULT_INVALID_INPUT_MESSAGE = "Invalid input!";

export
type CellDataType = 'string' | 'number' | 'integer' | 'boolean' | 'date' |
                    'string:option' | 'number:option' | 'integer:option'| 'date:option'|
                    'string:dynamic-option' | 'number:dynamic-option' | 'integer:dynamic-option' | 'date:dynamic-option';

export
interface ICellEditOptions {
  editor?: ICellEditor;
  validator?: ICellInputValidator;
  onCommit?: (response: ICellEditResponse) => void;
  onCancel?: () => void;
}

export
class PassInputValidator implements ICellInputValidator {
  validate(cell: CellEditor.CellConfig, value: any): ICellInputValidatorResponse {
    return { valid: true };
  }
}

export
class TextInputValidator implements ICellInputValidator {
  validate(cell: CellEditor.CellConfig, value: string): ICellInputValidatorResponse {
    if (value === null) {
      return { valid: true };
    }

    if (typeof value !== 'string') {
      return {
        valid: false,
        message: 'Input must be valid text'
      };
    }

    if (!isNaN(this.minLength) && value.length < this.minLength) {
      return {
        valid: false,
        message: `Text length must be greater than ${this.minLength}`
      };
    }

    if (!isNaN(this.maxLength) && value.length > this.maxLength) {
      return {
        valid: false,
        message: `Text length must be less than ${this.maxLength}`
      };
    }

    if (this.pattern && !this.pattern.test(value)) {
      return {
        valid: false,
        message: `Text doesn't match the required pattern`
      };
    }

    return { valid: true };
  }

  minLength: number = Number.NaN;
  maxLength: number = Number.NaN;
  pattern: RegExp | null = null;
}

export
class IntegerInputValidator implements ICellInputValidator {
  validate(cell: CellEditor.CellConfig, value: number): ICellInputValidatorResponse {
    if (value === null) {
      return { valid: true };
    }

    if (isNaN(value) || (value % 1 !== 0)) {
      return {
        valid: false,
        message: 'Input must be valid integer'
      };
    }

    if (!isNaN(this.min) && value < this.min) {
      return {
        valid: false,
        message: `Input must be greater than ${this.min}`
      };
    }

    if (!isNaN(this.max) && value > this.max) {
      return {
        valid: false,
        message: `Input must be less than ${this.max}`
      };
    }

    return { valid: true };
  }

  min: number = Number.NaN;
  max: number = Number.NaN;
}

export
class NumberInputValidator implements ICellInputValidator {
  validate(cell: CellEditor.CellConfig, value: number): ICellInputValidatorResponse {
    if (value === null) {
      return { valid: true };
    }

    if (isNaN(value)) {
      return {
        valid: false,
        message: 'Input must be valid number'
      };
    }

    if (!isNaN(this.min) && value < this.min) {
      return {
        valid: false,
        message: `Input must be greater than ${this.min}`
      };
    }

    if (!isNaN(this.max) && value > this.max) {
      return {
        valid: false,
        message: `Input must be less than ${this.max}`
      };
    }

    return { valid: true };
  }

  min: number = Number.NaN;
  max: number = Number.NaN;
}


export
abstract class CellEditor implements ICellEditor, IDisposable {
  constructor() {
    this.inputChanged.connect(() => {
      this.validate();
    });
  }

  /**
   * Whether the cell editor is disposed.
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Dispose of the resources held by cell editor handler.
   */
  dispose(): void {
    if (this._disposed) {
      return;
    }

    this._disposed = true;
    this.cell.grid.node.removeChild(this.viewportOccluder);
  }

  edit(cell: CellEditor.CellConfig, options?: ICellEditOptions): void {
    this.cell = cell;
    this.onCommit = options && options.onCommit;
    this.onCancel = options && options.onCancel;

    this.validator = (options && options.validator) ? options.validator : this.createValidatorBasedOnType();

    cell.grid.node.addEventListener('wheel', () => {
      this.updatePosition();
    });

    this._addContainer();

    this.updatePosition();
    this.startEditing();
  }

  cancel() {
    if (this._disposed) {
      return;
    }

    this.dispose();
    if (this.onCancel) {
      this.onCancel();
    }
  }

  protected abstract startEditing(): void;
  protected abstract getInput(): any;

  protected get validInput(): boolean {
    return this._validInput;
  }

  protected validate() {
    let value;
    try {
      value = this.getInput();
    } catch (error) {
      console.log(`Input error: ${error.message}`);
      this.setValidity(false, error.message || DEFAULT_INVALID_INPUT_MESSAGE);
      return;
    }

    if (this.validator) {
      const result = this.validator.validate(this.cell, value);
      if (result.valid) {
        this.setValidity(true);
      } else {
        this.setValidity(false, result.message || DEFAULT_INVALID_INPUT_MESSAGE);
      }
    } else {
      this.setValidity(true);
    }
  }

  protected setValidity(valid: boolean, message: string = "") {
    this._validInput = valid;

    if (valid) {
      this.cellContainer.classList.remove('invalid');
    } else {
      this.cellContainer.classList.add('invalid');
    }

    this.validityReportInput.setCustomValidity(message);
    if (message !== "") {
      this.form.reportValidity();
    }
  }

  protected createValidatorBasedOnType(): ICellInputValidator | undefined {
    const cell = this.cell;
    const metadata = cell.grid.dataModel!.metadata('body', cell.row, cell.column);

    switch (metadata && metadata.type) {
      case 'string':
        {
          const validator = new TextInputValidator();
          if (typeof(metadata!.format) === 'string') {
            const format = metadata!.format;
            switch (format) {
              case 'email':
                validator.pattern = new RegExp("^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$");
                break;
              case 'uuid':
                validator.pattern = new RegExp("[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}");
                break;
              case 'uri':
                // TODO
                break;
              case 'binary':
                // TODO
                break;
            }
          }

          if (metadata!.constraint) {
            if (metadata!.constraint.minLength !== undefined) {
              validator.minLength = metadata!.constraint.minLength;
            }
            if (metadata!.constraint.maxLength !== undefined) {
              validator.maxLength = metadata!.constraint.maxLength;
            }
            if (typeof(metadata!.constraint.pattern) === 'string') {
              validator.pattern = new RegExp(metadata!.constraint.pattern);
            }
          }
          return validator;
        }
        break;
      case 'number':
        {
          const validator = new NumberInputValidator();
          if (metadata!.constraint) {
            if (metadata!.constraint.minimum !== undefined) {
              validator.min = metadata!.constraint.minimum;
            }
            if (metadata!.constraint.maximum !== undefined) {
              validator.max = metadata!.constraint.maximum;
            }
          }
          return validator;
        }
        break;
      case 'integer':
        {
          const validator = new IntegerInputValidator();
          if (metadata!.constraint) {
            if (metadata!.constraint.minimum !== undefined) {
              validator.min = metadata!.constraint.minimum;
            }
            if (metadata!.constraint.maximum !== undefined) {
              validator.max = metadata!.constraint.maximum;
            }
          }
          return validator;
        }
        break;
    }

    return undefined;
  }

  protected getCellInfo(cell: CellEditor.CellConfig) {
    const { grid, row, column } = cell;
    const data = grid.dataModel!.data('body', row, column);

    const columnX = grid.headerWidth - grid.scrollX + grid.columnOffset('body', column);
    const rowY = grid.headerHeight - grid.scrollY + grid.rowOffset('body', row);
    const width = grid.columnSize('body', column);
    const height = grid.rowSize('body', row);

    return {
      grid: grid,
      row: row,
      column: column,
      data: data,
      x: columnX,
      y: rowY,
      width: width,
      height: height
    };
  }

  protected updatePosition(): void {
    const grid = this.cell.grid;
    const cellInfo = this.getCellInfo(this.cell);
    const headerHeight = grid.headerHeight;
    const headerWidth = grid.headerWidth;

    this.viewportOccluder.style.top = headerHeight + 'px';
    this.viewportOccluder.style.left = headerWidth + 'px';
    this.viewportOccluder.style.width = (grid.viewportWidth - headerWidth) + 'px';
    this.viewportOccluder.style.height = (grid.viewportHeight - headerHeight) + 'px';

    this.cellContainer.style.left = (cellInfo.x - 1 - headerWidth) + 'px';
    this.cellContainer.style.top = (cellInfo.y - 1 - headerHeight) + 'px';
    this.cellContainer.style.width = (cellInfo.width + 1) + 'px';
    this.cellContainer.style.height = (cellInfo.height + 1) + 'px';
    this.cellContainer.style.visibility = 'visible';
  }

  protected commit(cursorMovement: SelectionModel.CursorMoveDirection = 'none'): boolean {
    this.validate();

    if (!this._validInput) {
      return false;
    }

    let value;
    try {
      value = this.getInput();
    } catch (error) {
      console.log(`Input error: ${error.message}`);
      return false;
    }

    this.dispose();

    if (this.onCommit) {
      this.onCommit({
        cell: this.cell,
        value: value,
        cursorMovement: cursorMovement
      });
    }

    return true;
  }

  private _addContainer() {
    this.viewportOccluder = document.createElement('div');
    this.viewportOccluder.className = 'lm-DataGrid-cellEditorOccluder';
    this.cell.grid.node.appendChild(this.viewportOccluder);

    this.cellContainer = document.createElement('div');
    this.cellContainer.className = 'lm-DataGrid-cellEditorContainer';
    this.viewportOccluder.appendChild(this.cellContainer);

    this.form = document.createElement('form');
    this.cellContainer.appendChild(this.form);

    this.validityReportInput = document.createElement('input');
    this.validityReportInput.style.opacity = '0';
    this.validityReportInput.style.zIndex = '-1';
    this.validityReportInput.style.position = 'absolute';
    this.validityReportInput.style.left = '0';
    this.validityReportInput.style.top = '0';
    this.validityReportInput.style.width = '100%';
    this.validityReportInput.style.height = '100%';
    this.validityReportInput.style.visibility = 'visible';
    this.form.appendChild(this.validityReportInput);

    // update mouse event pass-through state based on input validity
    this.cellContainer.addEventListener('mouseleave', (event: MouseEvent) => {
      this.viewportOccluder.style.pointerEvents = this._validInput ? 'none' : 'auto';
    });
    this.cellContainer.addEventListener('mouseenter', (event: MouseEvent) => {
      this.viewportOccluder.style.pointerEvents = 'none';
    });
  }

  protected inputChanged = new Signal<this, void>(this);
  protected onCommit?: (response: ICellEditResponse) => void;
  protected onCancel?: () => void;
  protected cell: CellEditor.CellConfig;
  protected validator: ICellInputValidator | undefined;
  protected viewportOccluder: HTMLDivElement;
  protected cellContainer: HTMLDivElement;
  protected form: HTMLFormElement;
  protected validityReportInput: HTMLInputElement;
  private _disposed = false;
  private _validInput: boolean = true;
}

export
abstract class InputCellEditor extends CellEditor {
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'keydown':
        this._onKeyDown(event as KeyboardEvent);
        break;
      case 'blur':
        this._onBlur(event as FocusEvent);
        break;
      case 'input':
        this._onInput(event);
        break;
    }
  }

  dispose() {
    if (this.isDisposed) {
      return;
    }

    this._unbindEvents();

    super.dispose();
  }

  protected startEditing() {
    this.createWidget();

    const cell = this.cell;
    const cellInfo = this.getCellInfo(cell);
    this.input.value = this.deserialize(cellInfo.data);
    this.form.appendChild(this.input);
    this.input.select();
    this.input.focus();

    this.bindEvents();
  }

  protected deserialize(value: any): any {
    if (value === null || value === undefined) {
      return '';
    }

    return value.toString();
  }

  protected createWidget() {
    const input = document.createElement('input');
    input.classList.add('lm-DataGrid-cellEditorWidget');
    input.classList.add('lm-DataGrid-cellEditorInput');
    input.spellcheck = false;

    this.input = input;
  }

  protected bindEvents() {
    this.input.addEventListener('keydown', this);
    this.input.addEventListener('blur', this);
    this.input.addEventListener('input', this);
  }

  private _unbindEvents() {
    this.input.removeEventListener('keydown', this);
    this.input.removeEventListener('blur', this);
    this.input.removeEventListener('input', this);
  }

  private _onKeyDown(event: KeyboardEvent) {
    switch (getKeyboardLayout().keyForKeydownEvent(event)) {
      case 'Enter':
        this.commit(event.shiftKey ? 'up' : 'down');
        break;
      case 'Tab':
        this.commit(event.shiftKey ? 'left' : 'right');
        event.stopPropagation();
        event.preventDefault();
        break;
      case 'Escape':
        this.cancel();
        break;
      default:
        break;
    }
  }

  private _onBlur(event: FocusEvent) {
    if (this.isDisposed) {
      return;
    }

    if (!this.commit()) {
      event.preventDefault();
      event.stopPropagation();
      this.input.focus();
    }
  }

  private _onInput(event: Event) {
    this.inputChanged.emit(void 0);
  }

  protected input: HTMLInputElement;
}

export
class TextCellEditor extends InputCellEditor {
  protected getInput(): string | null {
    return this.input.value;
  }
}

export
class NumberCellEditor extends InputCellEditor {
  protected startEditing() {
    super.startEditing();

    this.input.type = 'number';
    this.input.step = 'any';

    const cell = this.cell;

    const metadata = cell.grid.dataModel!.metadata('body', cell.row, cell.column);
    const constraint = metadata.constraint;
    if (constraint) {
      if (constraint.minimum) {
        this.input.min = constraint.minimum;
      }
      if (constraint.maximum) {
        this.input.max = constraint.maximum;
      }
    }
  }

  protected getInput(): number | null {
    let value = this.input.value;
    if (value.trim() === '') {
      return null;
    }

    const floatValue = parseFloat(value);
    if (isNaN(floatValue)) {
      throw new Error('Invalid input');
    }

    return floatValue;
  }
}

export
class IntegerCellEditor extends InputCellEditor {
  protected startEditing() {
    super.startEditing();

    this.input.type = 'number';
    this.input.step = '1';

    const cell = this.cell;

    const metadata = cell.grid.dataModel!.metadata('body', cell.row, cell.column);
    const constraint = metadata.constraint;
    if (constraint) {
      if (constraint.minimum) {
        this.input.min = constraint.minimum;
      }
      if (constraint.maximum) {
        this.input.max = constraint.maximum;
      }
    }
  }

  protected getInput(): number | null {
    let value = this.input.value;
    if (value.trim() === '') {
      return null;
    }

    let intValue = parseInt(value);
    if (isNaN(intValue)) {
      throw new Error('Invalid input');
    }

    return intValue;
  }
}

export
class DateCellEditor extends CellEditor {
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'keydown':
        this._onKeyDown(event as KeyboardEvent);
        break;
      case 'blur':
        this._onBlur(event as FocusEvent);
        break;
    }
  }

  dispose() {
    if (this.isDisposed) {
      return;
    }

    this._unbindEvents();

    super.dispose();
  }

  protected startEditing() {
    this._createWidget();

    const cell = this.cell;
    const cellInfo = this.getCellInfo(cell);
    this._input.value = this._deserialize(cellInfo.data);
    this.form.appendChild(this._input);
    this._input.focus();

    this._bindEvents();
  }

  protected getInput(): string | null {
    return this._input.value;
  }

  private _deserialize(value: any): any {
    if (value === null || value === undefined) {
      return '';
    }

    return value.toString();
  }

  private _createWidget() {
    const input = document.createElement('input');
    input.type = 'date';
    input.pattern = "\d{4}-\d{2}-\d{2}";
    input.classList.add('lm-DataGrid-cellEditorWidget');
    input.classList.add('lm-DataGrid-cellEditorInput');

    this._input = input;
  }

  private _bindEvents() {
    this._input.addEventListener('keydown', this);
    this._input.addEventListener('blur', this);
  }

  private _unbindEvents() {
    this._input.removeEventListener('keydown', this);
    this._input.removeEventListener('blur', this);
  }

  private _onKeyDown(event: KeyboardEvent) {
    switch (getKeyboardLayout().keyForKeydownEvent(event)) {
      case 'Enter':
        this.commit(event.shiftKey ? 'up' : 'down');
        break;
      case 'Tab':
        this.commit(event.shiftKey ? 'left' : 'right');
        event.stopPropagation();
        event.preventDefault();
        break;
      case 'Escape':
        this.cancel();
        break;
      default:
        break;
    }
  }

  private _onBlur(event: FocusEvent) {
    if (this.isDisposed) {
      return;
    }

    if (!this.commit()) {
      event.preventDefault();
      event.stopPropagation();
      this._input.focus();
    }
  }

  private _input: HTMLInputElement;
}

export
class BooleanCellEditor extends CellEditor {
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'keydown':
        this._onKeyDown(event as KeyboardEvent);
        break;
      case 'mousedown':
        // fix focus loss problem in Safari and Firefox
        this._input.focus();
        event.stopPropagation();
        event.preventDefault();
        break;
      case 'blur':
        this._onBlur(event as FocusEvent);
        break;
    }
  }

  dispose() {
    if (this.isDisposed) {
      return;
    }

    this._unbindEvents();

    super.dispose();
  }

  protected startEditing() {
    this._createWidget();

    const cell = this.cell;
    const cellInfo = this.getCellInfo(cell);
    this._input.checked = this._deserialize(cellInfo.data);
    this.form.appendChild(this._input);
    this._input.focus();

    this._bindEvents();
  }

  protected getInput(): boolean | null {
    return this._input.checked;
  }

  private _deserialize(value: any): any {
    if (value === null || value === undefined) {
      return false;
    }

    return value == true;
  }

  private _createWidget() {
    const input = document.createElement('input');
    input.classList.add('lm-DataGrid-cellEditorWidget');
    input.classList.add('lm-DataGrid-cellEditorCheckbox');
    input.type = 'checkbox';
    input.spellcheck = false;

    this._input = input;
  }

  private _bindEvents() {
    this._input.addEventListener('keydown', this);
    this._input.addEventListener('mousedown', this);
    this._input.addEventListener('blur', this);
  }

  private _unbindEvents() {
    this._input.removeEventListener('keydown', this);
    this._input.removeEventListener('mousedown', this);
    this._input.removeEventListener('blur', this);
  }

  private _onKeyDown(event: KeyboardEvent) {
    switch (getKeyboardLayout().keyForKeydownEvent(event)) {
      case 'Enter':
        this.commit(event.shiftKey ? 'up' : 'down');
        break;
      case 'Tab':
        this.commit(event.shiftKey ? 'left' : 'right');
        event.stopPropagation();
        event.preventDefault();
        break;
      case 'Escape':
        this.cancel();
        break;
      default:
        break;
    }
  }

  private _onBlur(event: FocusEvent) {
    if (this.isDisposed) {
      return;
    }

    if (!this.commit()) {
      event.preventDefault();
      event.stopPropagation();
      this._input.focus();
    }
  }

  private _input: HTMLInputElement;
}

export
class OptionCellEditor extends CellEditor {
  dispose() {
    if (this.isDisposed) {
      return;
    }

    super.dispose();

    if (this._isMultiSelect) {
      document.body.removeChild(this._select);
    }
  }

  protected startEditing() {
    const cell = this.cell;
    const cellInfo = this.getCellInfo(cell);
    const metadata = cell.grid.dataModel!.metadata('body', cell.row, cell.column);
    this._isMultiSelect = metadata.type === 'array';
    this._createWidget();

    if (this._isMultiSelect) {
      this._select.multiple = true;
      const values = this._deserialize(cellInfo.data) as string[];
      for (let i = 0; i < this._select.options.length; ++i) {
        const option = this._select.options.item(i);
        option!.selected = values.indexOf(option!.value) !== -1;
      }
      document.body.appendChild(this._select);
    } else {
      this._select.value = this._deserialize(cellInfo.data) as string;
      this.form.appendChild(this._select);
    }

    this._select.focus();

    this._bindEvents();

    this.updatePosition();
  }

  protected getInput(): string | string[] | null {
    if (this._isMultiSelect) {
      const input: string[] = [];
      for (let i = 0; i < this._select.selectedOptions.length; ++i) {
        input.push(this._select.selectedOptions.item(i)!.value);
      }
      return input;
    } else {
      return this._select.value;
    }
  }

  protected updatePosition(): void {
    super.updatePosition();

    if (!this._isMultiSelect) {
      return;
    }

    const cellInfo = this.getCellInfo(this.cell);

    this._select.style.position = 'absolute';
    const cellContainerRect = this.cellContainer.getBoundingClientRect();

    this._select.style.left = cellContainerRect.left + 'px';
    this._select.style.top = (cellContainerRect.top + cellInfo.height) + 'px';
    this._select.style.width = cellContainerRect.width + 'px';
    this._select.style.maxHeight = '60px';

    this.cellContainer.style.visibility = 'hidden';
  }

  private _deserialize(value: any): string | string[] {
    if (value === null || value === undefined) {
      return '';
    }

    if (this._isMultiSelect) {
      const values: string[] = [];
      if (Array.isArray(value)) {
        for (let item of value) {
          values.push(item.toString());
        }
      }
      return values;
    } else {
      return value.toString();
    }
  }

  private _createWidget() {
    const cell = this.cell;
    const metadata = cell.grid.dataModel!.metadata('body', cell.row, cell.column);
    const items = metadata.constraint.enum;

    const select = document.createElement('select');
    select.classList.add('lm-DataGrid-cellEditorWidget');
    for (let item of items) {
      const option = document.createElement("option");
      option.value = item;
      option.text = item;
      select.appendChild(option);
    }

    this._select = select;
  }

  private _bindEvents() {
    this._select.addEventListener('keydown', this._onKeyDown.bind(this));
    this._select.addEventListener('blur', this._onBlur.bind(this));
  }

  private _onKeyDown(event: KeyboardEvent) {
    switch (getKeyboardLayout().keyForKeydownEvent(event)) {
      case 'Enter':
        this.commit(event.shiftKey ? 'up' : 'down');
        break;
      case 'Tab':
        this.commit(event.shiftKey ? 'left' : 'right');
        event.stopPropagation();
        event.preventDefault();
        break;
      case 'Escape':
        this.cancel();
        break;
      default:
        break;
    }
  }

  private _onBlur(event: FocusEvent) {
    if (this.isDisposed) {
      return;
    }

    if (!this.commit()) {
      event.preventDefault();
      event.stopPropagation();
      this._select.focus();
    }
  }

  private _select: HTMLSelectElement;
  private _isMultiSelect: boolean = false;
}

export
class DynamicOptionCellEditor extends CellEditor {
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'keydown':
        this._onKeyDown(event as KeyboardEvent);
        break;
      case 'blur':
        this._onBlur(event as FocusEvent);
        break;
    }
  }

  dispose() {
    if (this.isDisposed) {
      return;
    }

    this._unbindEvents();

    super.dispose();
  }

  protected startEditing() {
    this._createWidget();

    const cell = this.cell;
    const cellInfo = this.getCellInfo(cell);
    this._input.value = this._deserialize(cellInfo.data);
    this.form.appendChild(this._input);
    this._input.select();
    this._input.focus();

    this._bindEvents();
  }

  protected getInput(): string | null {
    return this._input.value;
  }

  private _deserialize(value: any): any {
    if (value === null || value === undefined) {
      return '';
    }

    return value.toString();
  }

  private _createWidget() {
    const cell = this.cell;
    const grid = cell.grid;
    const dataModel = grid.dataModel!;
    const rowCount = dataModel.rowCount('body');

    const listId = 'cell-editor-list';
    const list = document.createElement('datalist');
    list.id = listId;
    const input = document.createElement('input');
    input.classList.add('lm-DataGrid-cellEditorWidget');
    input.classList.add('lm-DataGrid-cellEditorInput');
    const valueSet = new Set<string>();
    for (let r = 0; r < rowCount; ++r) {
      const data = dataModel.data('body', r, cell.column);
      if (data) {
        valueSet.add(data);
      }
    }
    valueSet.forEach((value: string) => {
      const option = document.createElement("option");
      option.value = value;
      option.text = value;
      list.appendChild(option);
    });
    this.form.appendChild(list);
    input.setAttribute('list', listId);

    this._input = input;
  }

  private _bindEvents() {
    this._input.addEventListener('keydown', this);
    this._input.addEventListener('blur', this);
  }

  private _unbindEvents() {
    this._input.removeEventListener('keydown', this);
    this._input.removeEventListener('blur', this);
  }

  private _onKeyDown(event: KeyboardEvent) {
    switch (getKeyboardLayout().keyForKeydownEvent(event)) {
      case 'Enter':
        this.commit(event.shiftKey ? 'up' : 'down');
        break;
      case 'Tab':
        this.commit(event.shiftKey ? 'left' : 'right');
        event.stopPropagation();
        event.preventDefault();
        break;
      case 'Escape':
        this.cancel();
        break;
      default:
        break;
    }
  }

  private _onBlur(event: FocusEvent) {
    if (this.isDisposed) {
      return;
    }

    if (!this.commit()) {
      event.preventDefault();
      event.stopPropagation();
      this._input.focus();
    }
  }

  private _input: HTMLInputElement;
}


export
namespace CellEditor {
  /**
   * An object which holds the configuration data for a cell.
   */
  export
  type CellConfig = {
    /**
     * The grid containing the cell.
     */
    readonly grid: DataGrid;
    /**
     * The row index of the cell.
     */
    readonly row: number;

    /**
     * The column index of the cell.
     */
    readonly column: number;
  };
}
