/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2019, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { IDisposable } from '@lumino/disposable';

import { DataGrid } from './datagrid';

import { SelectionModel } from './selectionmodel';

import { getKeyboardLayout } from '@lumino/keyboard';

import { Signal } from '@lumino/signaling';

import { Notification } from './notification';

import { CellGroup } from './cellgroup';

/**
 * A response object returned from cell input validator
 */
export interface ICellInputValidatorResponse {
  /**
   * Flag indicating cell input is valid or not
   */
  valid: boolean;
  /**
   * Validation error message. Set only when input is invalid
   */
  message?: string;
}

/**
 * An object which validates cell input values.
 */
export interface ICellInputValidator {
  /**
   * Validate cell input.
   *
   * @param cell - The object holding cell configuration data.
   *
   * @param value - The cell value input.
   *
   * @returns An object with validation result.
   */
  validate(
    cell: CellEditor.CellConfig,
    value: any
  ): ICellInputValidatorResponse;
}

/**
 * An object returned from cell editor after a successful edit.
 */
export interface ICellEditResponse {
  /**
   * An object which holds the configuration data for a cell.
   */
  cell: CellEditor.CellConfig;
  /**
   * Value input.
   */
  value: any;
  /**
   * Cursor move direction based on keys pressed to end the edit.
   */
  cursorMovement: SelectionModel.CursorMoveDirection;
}

/**
 * An object implementing cell editing.
 */
export interface ICellEditor {
  /**
   * Start editing the cell.
   *
   * @param cell - The object holding cell configuration data.
   *
   * @param options - The cell editing options.
   */
  edit(cell: CellEditor.CellConfig, options?: ICellEditOptions): void;
  /**
   * Cancel editing the cell.
   */
  cancel(): void;
}

// default validation error message
const DEFAULT_INVALID_INPUT_MESSAGE = 'Invalid input!';

// A type alias for available cell data types
export type CellDataType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'date'
  | 'string:option'
  | 'number:option'
  | 'integer:option'
  | 'date:option'
  | 'string:dynamic-option'
  | 'number:dynamic-option'
  | 'integer:dynamic-option'
  | 'date:dynamic-option';

/**
 * An object containing cell editing options.
 */
export interface ICellEditOptions {
  /**
   * Cell editor to use for editing.
   *
   * #### Notes
   * This object is only used by cell editor controller.
   * If not set, controller picks the most suitable editor
   * for the particular cell configuration.
   */
  editor?: ICellEditor;
  /**
   * Cell input validator to use for value validation.
   */
  validator?: ICellInputValidator;
  /**
   * Callback method to call on cell edit commit.
   */
  onCommit?: (response: ICellEditResponse) => void;
  /**
   * Callback method to call on cell edit cancel.
   */
  onCancel?: () => void;
}

/**
 * A cell input validator object which always returns valid.
 */
export class PassInputValidator implements ICellInputValidator {
  /**
   * Validate cell input.
   *
   * @param cell - The object holding cell configuration data.
   *
   * @param value - The cell value input.
   *
   * @returns An object with validation result.
   */
  validate(
    cell: CellEditor.CellConfig,
    value: any
  ): ICellInputValidatorResponse {
    return { valid: true };
  }
}

/**
 * Text cell input validator.
 */
export class TextInputValidator implements ICellInputValidator {
  /**
   * Validate cell input.
   *
   * @param cell - The object holding cell configuration data.
   *
   * @param value - The cell value input.
   *
   * @returns An object with validation result.
   */
  validate(
    cell: CellEditor.CellConfig,
    value: string
  ): ICellInputValidatorResponse {
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

  /**
   * Minimum text length
   *
   * The default is Number.NaN, meaning no minimum constraint
   */
  minLength: number = Number.NaN;
  /**
   * Maximum text length
   *
   * The default is Number.NaN, meaning no maximum constraint
   */
  maxLength: number = Number.NaN;
  /**
   * Required text pattern as regular expression
   *
   * The default is null, meaning no pattern constraint
   */
  pattern: RegExp | null = null;
}

/**
 * Integer cell input validator.
 */
export class IntegerInputValidator implements ICellInputValidator {
  /**
   * Validate cell input.
   *
   * @param cell - The object holding cell configuration data.
   *
   * @param value - The cell value input.
   *
   * @returns An object with validation result.
   */
  validate(
    cell: CellEditor.CellConfig,
    value: number
  ): ICellInputValidatorResponse {
    if (value === null) {
      return { valid: true };
    }

    if (isNaN(value) || value % 1 !== 0) {
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

  /**
   * Minimum value
   *
   * The default is Number.NaN, meaning no minimum constraint
   */
  min: number = Number.NaN;
  /**
   * Maximum value
   *
   * The default is Number.NaN, meaning no maximum constraint
   */
  max: number = Number.NaN;
}

/**
 * Real number cell input validator.
 */
export class NumberInputValidator implements ICellInputValidator {
  /**
   * Validate cell input.
   *
   * @param cell - The object holding cell configuration data.
   *
   * @param value - The cell value input.
   *
   * @returns An object with validation result.
   */
  validate(
    cell: CellEditor.CellConfig,
    value: number
  ): ICellInputValidatorResponse {
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

  /**
   * Minimum value
   *
   * The default is Number.NaN, meaning no minimum constraint
   */
  min: number = Number.NaN;
  /**
   * Maximum value
   *
   * The default is Number.NaN, meaning no maximum constraint
   */
  max: number = Number.NaN;
}

/**
 * An abstract base class that provides the most of the functionality
 * needed by a cell editor. All of the built-in cell editors
 * for various cell types are derived from this base class. Custom cell editors
 * can be easily implemented by extending this class.
 */
export abstract class CellEditor implements ICellEditor, IDisposable {
  /**
   * Construct a new cell editor.
   */
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
   * Dispose of the resources held by cell editor.
   */
  dispose(): void {
    if (this._disposed) {
      return;
    }

    if (this._gridWheelEventHandler) {
      this.cell.grid.node.removeEventListener(
        'wheel',
        this._gridWheelEventHandler
      );
      this._gridWheelEventHandler = null;
    }

    this._closeValidityNotification();

    this._disposed = true;
    this.cell.grid.node.removeChild(this.viewportOccluder);
  }

  /**
   * Start editing the cell.
   *
   * @param cell - The object holding cell configuration data.
   *
   * @param options - The cell editing options.
   */
  edit(cell: CellEditor.CellConfig, options?: ICellEditOptions): void {
    this.cell = cell;
    this.onCommit = options && options.onCommit;
    this.onCancel = options && options.onCancel;

    this.validator =
      options && options.validator
        ? options.validator
        : this.createValidatorBasedOnType();

    this._gridWheelEventHandler = () => {
      this._closeValidityNotification();
      this.updatePosition();
    };

    cell.grid.node.addEventListener('wheel', this._gridWheelEventHandler);

    this._addContainer();

    this.updatePosition();
    this.startEditing();
  }

  /**
   * Cancel editing the cell.
   */
  cancel() {
    if (this._disposed) {
      return;
    }

    this.dispose();
    if (this.onCancel) {
      this.onCancel();
    }
  }

  /**
   * Start editing the cell. Usually an editor widget is created and
   *  added to `editorContainer`
   */
  protected abstract startEditing(): void;
  /**
   * Return the current input entered. This method throws exceptions
   * if input is invalid. Error message in exception is shown as notification.
   */
  protected abstract getInput(): any;

  /**
   * Whether the value input is valid.
   */
  protected get validInput(): boolean {
    return this._validInput;
  }

  /**
   * Validate the cell input. Shows validation error notification when input is invalid.
   */
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
        this.setValidity(
          false,
          result.message || DEFAULT_INVALID_INPUT_MESSAGE
        );
      }
    } else {
      this.setValidity(true);
    }
  }

  /**
   * Set validity flag.
   *
   * @param valid - Whether the input is valid.
   *
   * @param message - Notification message to show.
   *
   * If message is set to empty string (which is the default)
   * existing notification popup is removed if any.
   */
  protected setValidity(valid: boolean, message: string = '') {
    this._validInput = valid;

    this._closeValidityNotification();

    if (valid) {
      this.editorContainer.classList.remove('lm-mod-invalid');
    } else {
      this.editorContainer.classList.add('lm-mod-invalid');

      // show a notification popup
      if (message !== '') {
        this.validityNotification = new Notification({
          target: this.editorContainer,
          message: message,
          placement: 'bottom',
          timeout: 5000
        });
        this.validityNotification.show();
      }
    }
  }

  /**
   * Create and return a cell input validator based on configuration of the
   * cell being edited. If no suitable validator can be found, it returns undefined.
   */
  protected createValidatorBasedOnType(): ICellInputValidator | undefined {
    const cell = this.cell;
    const metadata = cell.grid.dataModel!.metadata(
      'body',
      cell.row,
      cell.column
    );

    switch (metadata && metadata.type) {
      case 'string':
        {
          const validator = new TextInputValidator();
          if (typeof metadata!.format === 'string') {
            const format = metadata!.format;
            switch (format) {
              case 'email':
                validator.pattern = new RegExp(
                  '^([a-z0-9_.-]+)@([da-z.-]+).([a-z.]{2,6})$'
                );
                break;
              case 'uuid':
                validator.pattern = new RegExp(
                  '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
                );
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
            if (typeof metadata!.constraint.pattern === 'string') {
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

  /**
   * Compute cell rectangle and return with other cell properties.
   */
  protected getCellInfo(cell: CellEditor.CellConfig): Private.ICellInfo {
    const { grid, row, column } = cell;
    let data, columnX, rowY, width, height;
    const cellGroup = CellGroup.getGroup(grid.dataModel!, 'body', row, column);

    if (cellGroup) {
      columnX =
        grid.headerWidth -
        grid.scrollX +
        grid.columnOffset('body', cellGroup.c1);
      rowY =
        grid.headerHeight - grid.scrollY + grid.rowOffset('body', cellGroup.r1);
      width = 0;
      height = 0;

      for (let r = cellGroup.r1; r <= cellGroup.r2; r++) {
        height += grid.rowSize('body', r);
      }

      for (let c = cellGroup.c1; c <= cellGroup.c2; c++) {
        width += grid.columnSize('body', c);
      }

      data = grid.dataModel!.data('body', cellGroup.r1, cellGroup.c1);
    } else {
      columnX =
        grid.headerWidth - grid.scrollX + grid.columnOffset('body', column);
      rowY = grid.headerHeight - grid.scrollY + grid.rowOffset('body', row);
      width = grid.columnSize('body', column);
      height = grid.rowSize('body', row);
      data = grid.dataModel!.data('body', row, column);
    }

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

  /**
   * Reposition cell editor by moving viewport occluder and cell editor container.
   */
  protected updatePosition(): void {
    const grid = this.cell.grid;
    const cellInfo = this.getCellInfo(this.cell);
    const headerHeight = grid.headerHeight;
    const headerWidth = grid.headerWidth;

    this.viewportOccluder.style.top = headerHeight + 'px';
    this.viewportOccluder.style.left = headerWidth + 'px';
    this.viewportOccluder.style.width = grid.viewportWidth - headerWidth + 'px';
    this.viewportOccluder.style.height =
      grid.viewportHeight - headerHeight + 'px';
    this.viewportOccluder.style.position = 'absolute';

    this.editorContainer.style.left = cellInfo.x - 1 - headerWidth + 'px';
    this.editorContainer.style.top = cellInfo.y - 1 - headerHeight + 'px';
    this.editorContainer.style.width = cellInfo.width + 1 + 'px';
    this.editorContainer.style.height = cellInfo.height + 1 + 'px';
    this.editorContainer.style.visibility = 'visible';
    this.editorContainer.style.position = 'absolute';
  }

  /**
   * Commit the edited value.
   *
   * @param cursorMovement - Cursor move direction based on keys pressed to end the edit.
   *
   * @returns true on valid input, false otherwise.
   */
  protected commit(
    cursorMovement: SelectionModel.CursorMoveDirection = 'none'
  ): boolean {
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

  /**
   * Create container elements needed to prevent editor widget overflow
   * beyond viewport and to position cell editor widget.
   */
  private _addContainer() {
    this.viewportOccluder = document.createElement('div');
    this.viewportOccluder.className = 'lm-DataGrid-cellEditorOccluder';
    this.cell.grid.node.appendChild(this.viewportOccluder);

    this.editorContainer = document.createElement('div');
    this.editorContainer.className = 'lm-DataGrid-cellEditorContainer';
    this.viewportOccluder.appendChild(this.editorContainer);

    // update mouse event pass-through state based on input validity
    this.editorContainer.addEventListener('mouseleave', (event: MouseEvent) => {
      this.viewportOccluder.style.pointerEvents = this._validInput
        ? 'none'
        : 'auto';
    });
    this.editorContainer.addEventListener('mouseenter', (event: MouseEvent) => {
      this.viewportOccluder.style.pointerEvents = 'none';
    });
  }

  /**
   * Remove validity notification popup.
   */
  private _closeValidityNotification() {
    if (this.validityNotification) {
      this.validityNotification.close();
      this.validityNotification = null;
    }
  }

  /**
   * A signal emitted when input changes.
   */
  protected inputChanged = new Signal<this, void>(this);
  /**
   * Callback method to call on cell edit commit.
   */
  protected onCommit?: (response: ICellEditResponse) => void;
  /**
   * Callback method to call on cell edit cancel.
   */
  protected onCancel?: () => void;
  /**
   * Cell configuration data for the cell being edited.
   */
  protected cell: CellEditor.CellConfig;
  /**
   * Cell input validator to use for the cell being edited.
   */
  protected validator: ICellInputValidator | undefined;
  /**
   * The div element used to prevent editor widget overflow beyond grid viewport.
   */
  protected viewportOccluder: HTMLDivElement;
  /**
   * The div element used to contain and position editor widget.
   */
  protected editorContainer: HTMLDivElement;
  /**
   * Notification popup used to show validation error messages.
   */
  protected validityNotification: Notification | null = null;
  /**
   * Whether the cell editor is disposed.
   */
  private _disposed = false;
  /**
   * Whether the value input is valid.
   */
  private _validInput: boolean = true;
  /**
   * Grid wheel event handler.
   */
  private _gridWheelEventHandler:
    | ((this: HTMLElement, ev: WheelEvent) => any)
    | null = null;
}

/**
 * Abstract base class with shared functionality
 * for cell editors which use HTML Input widget as editor.
 */
export abstract class InputCellEditor extends CellEditor {
  /**
   * Handle the DOM events for the editor.
   *
   * @param event - The DOM event sent to the editor.
   */
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

  /**
   * Dispose of the resources held by cell editor.
   */
  dispose() {
    if (this.isDisposed) {
      return;
    }

    this._unbindEvents();

    super.dispose();
  }

  /**
   * Start editing the cell.
   */
  protected startEditing() {
    this.createWidget();

    const cell = this.cell;
    const cellInfo = this.getCellInfo(cell);
    this.input.value = this.deserialize(cellInfo.data);
    this.editorContainer.appendChild(this.input);
    this.input.focus();
    this.input.select();

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
    input.type = this.inputType;

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
  protected abstract inputType: string;
}

/**
 * Cell editor for text cells.
 */
export class TextCellEditor extends InputCellEditor {
  /**
   * Return the current text input entered.
   */
  protected getInput(): string | null {
    return this.input.value;
  }

  protected inputType: string = 'text';
}

/**
 * Cell editor for real number cells.
 */
export class NumberCellEditor extends InputCellEditor {
  /**
   * Start editing the cell.
   */
  protected startEditing() {
    super.startEditing();

    this.input.step = 'any';

    const cell = this.cell;

    const metadata = cell.grid.dataModel!.metadata(
      'body',
      cell.row,
      cell.column
    );
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

  /**
   * Return the current number input entered. This method throws exception
   * if input is invalid.
   */
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

  protected inputType: string = 'number';
}

/**
 * Cell editor for integer cells.
 */
export class IntegerCellEditor extends InputCellEditor {
  /**
   * Start editing the cell.
   */
  protected startEditing() {
    super.startEditing();

    this.input.step = '1';

    const cell = this.cell;

    const metadata = cell.grid.dataModel!.metadata(
      'body',
      cell.row,
      cell.column
    );
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

  /**
   * Return the current integer input entered. This method throws exception
   * if input is invalid.
   */
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

  protected inputType: string = 'number';
}

/**
 * Cell editor for date cells.
 */
export class DateCellEditor extends CellEditor {
  /**
   * Handle the DOM events for the editor.
   *
   * @param event - The DOM event sent to the editor.
   */
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

  /**
   * Dispose of the resources held by cell editor.
   */
  dispose() {
    if (this.isDisposed) {
      return;
    }

    this._unbindEvents();

    super.dispose();
  }

  /**
   * Start editing the cell.
   */
  protected startEditing() {
    this._createWidget();

    const cell = this.cell;
    const cellInfo = this.getCellInfo(cell);
    this._input.value = this._deserialize(cellInfo.data);
    this.editorContainer.appendChild(this._input);
    this._input.focus();

    this._bindEvents();
  }

  /**
   * Return the current date input entered.
   */
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
    input.pattern = 'd{4}-d{2}-d{2}';
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

/**
 * Cell editor for boolean cells.
 */
export class BooleanCellEditor extends CellEditor {
  /**
   * Handle the DOM events for the editor.
   *
   * @param event - The DOM event sent to the editor.
   */
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

  /**
   * Dispose of the resources held by cell editor.
   */
  dispose() {
    if (this.isDisposed) {
      return;
    }

    this._unbindEvents();

    super.dispose();
  }

  /**
   * Start editing the cell.
   */
  protected startEditing() {
    this._createWidget();

    const cell = this.cell;
    const cellInfo = this.getCellInfo(cell);
    this._input.checked = this._deserialize(cellInfo.data);
    this.editorContainer.appendChild(this._input);
    this._input.focus();

    this._bindEvents();
  }

  /**
   * Return the current boolean input entered.
   */
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

/**
 * Cell editor for option cells.
 *
 * It supports multiple option selection. If cell metadata contains
 * type attribute 'array', then it behaves as a multi select.
 * In that case cell data is expected to be list of string values.
 */
export class OptionCellEditor extends CellEditor {
  /**
   * Dispose of the resources held by cell editor.
   */
  dispose() {
    if (this.isDisposed) {
      return;
    }

    super.dispose();

    if (this._isMultiSelect) {
      document.body.removeChild(this._select);
    }
  }

  /**
   * Start editing the cell.
   */
  protected startEditing() {
    const cell = this.cell;
    const cellInfo = this.getCellInfo(cell);
    const metadata = cell.grid.dataModel!.metadata(
      'body',
      cell.row,
      cell.column
    );
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
      this.editorContainer.appendChild(this._select);
    }

    this._select.focus();

    this._bindEvents();

    this.updatePosition();
  }

  /**
   * Return the current option input.
   */
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

  /**
   * Reposition cell editor.
   */
  protected updatePosition(): void {
    super.updatePosition();

    if (!this._isMultiSelect) {
      return;
    }

    const cellInfo = this.getCellInfo(this.cell);

    this._select.style.position = 'absolute';
    const editorContainerRect = this.editorContainer.getBoundingClientRect();

    this._select.style.left = editorContainerRect.left + 'px';
    this._select.style.top = editorContainerRect.top + cellInfo.height + 'px';
    this._select.style.width = editorContainerRect.width + 'px';
    this._select.style.maxHeight = '60px';

    this.editorContainer.style.visibility = 'hidden';
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
    const metadata = cell.grid.dataModel!.metadata(
      'body',
      cell.row,
      cell.column
    );
    const items = metadata.constraint.enum;

    const select = document.createElement('select');
    select.classList.add('lm-DataGrid-cellEditorWidget');
    for (let item of items) {
      const option = document.createElement('option');
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

/**
 * Cell editor for option cells whose value can be any value
 * from set of pre-defined options or values that can be input by user.
 */
export class DynamicOptionCellEditor extends CellEditor {
  /**
   * Handle the DOM events for the editor.
   *
   * @param event - The DOM event sent to the editor.
   */
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

  /**
   * Dispose of the resources held by cell editor.
   */
  dispose() {
    if (this.isDisposed) {
      return;
    }

    this._unbindEvents();

    super.dispose();
  }

  /**
   * Start editing the cell.
   */
  protected startEditing() {
    this._createWidget();

    const cell = this.cell;
    const cellInfo = this.getCellInfo(cell);
    this._input.value = this._deserialize(cellInfo.data);
    this.editorContainer.appendChild(this._input);
    this._input.focus();
    this._input.select();

    this._bindEvents();
  }

  /**
   * Return the current option input.
   */
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
      const option = document.createElement('option');
      option.value = value;
      option.text = value;
      list.appendChild(option);
    });
    this.editorContainer.appendChild(list);
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

/**
 * The namespace for the `CellEditor` class statics.
 */
export namespace CellEditor {
  /**
   * An object which holds the configuration data for a cell.
   */
  export type CellConfig = {
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

/**
 * A namespace for module-private functionality.
 */
namespace Private {
  /**
   * A type alias for cell properties.
   */
  export type ICellInfo = {
    grid: DataGrid;
    row: number;
    column: number;
    data: any;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
