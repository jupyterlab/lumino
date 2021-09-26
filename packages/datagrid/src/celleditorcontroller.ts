/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2019, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import {
  BooleanCellEditor,
  CellDataType,
  CellEditor,
  DateCellEditor,
  DynamicOptionCellEditor,
  ICellEditOptions,
  ICellEditor,
  ICellEditResponse,
  IntegerCellEditor,
  NumberCellEditor,
  OptionCellEditor,
  TextCellEditor
} from './celleditor';

import { CellGroup } from './cellgroup';

import { DataModel, MutableDataModel } from './datamodel';

/**
 * A type alias for cell editor override identifier.
 */
export type EditorOverrideIdentifier =
  | CellDataType
  | DataModel.Metadata
  | 'default';

/**
 * An object which manages cell editing.
 */
export interface ICellEditorController {
  /**
   * Override cell editor for the cells matching the identifier.
   *
   * @param identifier - Cell identifier to use when matching cells.
   * if identifier is a CellDataType, then cell matching is done using data type of the cell,
   * if identifier is a Metadata, then partial match of the cell metadata with identifier is used for match,
   * if identifier is 'default' then override is used as default editor when no other editor is found suitable
   *
   * @param editor - The cell editor to use or resolver to use to get an editor for matching cells.
   */
  setEditor(
    identifier: EditorOverrideIdentifier,
    editor: ICellEditor | Resolver
  ): void;
  /**
   * Start editing a cell.
   *
   * @param cell - The object holding cell configuration data.
   *
   * @param options - The cell editing options.
   */
  edit(cell: CellEditor.CellConfig, options?: ICellEditOptions): boolean;
  /**
   * Cancel editing.
   */
  cancel(): void;
}

/**
 * A type alias for a cell editor config function.
 *
 * This type is used to compute a value from a cell config object.
 */
export type ConfigFunc<T> = (config: CellEditor.CellConfig) => T;

/**
 * A type alias for a cell editor config option.
 *
 * A config option can be a static value or a config function.
 */
export type ConfigOption<T> = T | ConfigFunc<T>;

/**
 * A type alias for a cell editor resolver function.
 */
export type Resolver = ConfigFunc<ICellEditor | undefined>;

/**
 * Resolve a config option for a cell editor.
 *
 * @param option - The config option to resolve.
 *
 * @param config - The cell config object.
 *
 * @returns The resolved value for the option.
 */
export function resolveOption<T>(
  option: ConfigOption<T>,
  config: CellEditor.CellConfig
): T {
  return typeof option === 'function'
    ? (option as ConfigFunc<T>)(config)
    : option;
}

/**
 * An object which manages cell editing. It stores editor overrides,
 * decides which editor to use for a cell, makes sure there is only one editor active.
 */
export class CellEditorController implements ICellEditorController {
  /**
   * Override cell editor for the cells matching the identifier.
   *
   * @param identifier - Cell identifier to use when matching cells.
   * if identifier is a CellDataType, then cell matching is done using data type of the cell,
   * if identifier is a Metadata, then partial match of the cell metadata with identifier is used for match,
   * if identifier is 'default' then override is used as default editor when no other editor is found suitable
   *
   * @param editor - The cell editor to use or resolver to use to get an editor for matching cells.
   */
  setEditor(
    identifier: EditorOverrideIdentifier,
    editor: ICellEditor | Resolver
  ) {
    if (typeof identifier === 'string') {
      this._typeBasedOverrides.set(identifier, editor);
    } else {
      const key = this._metadataIdentifierToKey(identifier);
      this._metadataBasedOverrides.set(key, [identifier, editor]);
    }
  }

  /**
   * Start editing a cell.
   *
   * @param cell - The object holding cell configuration data.
   *
   * @param options - The cell editing options.
   */
  edit(cell: CellEditor.CellConfig, options?: ICellEditOptions): boolean {
    const grid = cell.grid;

    if (!grid.editable) {
      console.error('Grid cannot be edited!');
      return false;
    }

    this.cancel();

    this._cell = cell;

    options = options || {};
    options.onCommit = options.onCommit || this._onCommit.bind(this);
    options.onCancel = options.onCancel || this._onCancel.bind(this);

    // if an editor is passed in with options, then use it for editing
    if (options.editor) {
      this._editor = options.editor;
      options.editor.edit(cell, options);
      return true;
    }

    // choose an editor based on overrides / cell data type
    const editor = this._getEditor(cell);
    if (editor) {
      this._editor = editor;
      editor.edit(cell, options);
      return true;
    }

    return false;
  }

  /**
   * Cancel editing.
   */
  cancel(): void {
    if (this._editor) {
      this._editor.cancel();
      this._editor = null;
    }

    this._cell = null;
  }

  private _onCommit(response: ICellEditResponse): void {
    const cell = this._cell;

    if (!cell) {
      return;
    }

    const grid = cell.grid;
    const dataModel = grid.dataModel as MutableDataModel;
    let row = cell.row;
    let column = cell.column;

    const cellGroup = CellGroup.getGroup(grid.dataModel!, 'body', row, column);
    if (cellGroup) {
      row = cellGroup.r1;
      column = cellGroup.c1;
    }

    dataModel.setData('body', row, column, response.value);
    grid.viewport.node.focus();
    if (response.cursorMovement !== 'none') {
      grid.moveCursor(response.cursorMovement);
      grid.scrollToCursor();
    }
  }

  private _onCancel(): void {
    if (!this._cell) {
      return;
    }

    this._cell.grid.viewport.node.focus();
  }

  private _getDataTypeKey(cell: CellEditor.CellConfig): string {
    const metadata = cell.grid.dataModel
      ? cell.grid.dataModel.metadata('body', cell.row, cell.column)
      : null;

    if (!metadata) {
      return 'default';
    }

    let key = '';

    if (metadata) {
      key = metadata.type;
    }

    if (metadata.constraint && metadata.constraint.enum) {
      if (metadata.constraint.enum === 'dynamic') {
        key += ':dynamic-option';
      } else {
        key += ':option';
      }
    }

    return key;
  }

  private _objectToKey(object: any): string {
    let str = '';
    for (let key in object) {
      const value = object[key];
      if (typeof value === 'object') {
        str += `${key}:${this._objectToKey(value)}`;
      } else {
        str += `[${key}:${value}]`;
      }
    }

    return str;
  }

  private _metadataIdentifierToKey(metadata: DataModel.Metadata): string {
    return this._objectToKey(metadata);
  }

  private _metadataMatchesIdentifier(
    metadata: DataModel.Metadata,
    identifier: DataModel.Metadata
  ): boolean {
    for (let key in identifier) {
      if (!metadata.hasOwnProperty(key)) {
        return false;
      }

      const identifierValue = identifier[key];
      const metadataValue = metadata[key];
      if (typeof identifierValue === 'object') {
        if (!this._metadataMatchesIdentifier(metadataValue, identifierValue)) {
          return false;
        }
      } else if (metadataValue !== identifierValue) {
        return false;
      }
    }

    return true;
  }

  private _getMetadataBasedEditor(
    cell: CellEditor.CellConfig
  ): ICellEditor | undefined {
    let editorMatched: ICellEditor | undefined;
    const metadata = cell.grid.dataModel!.metadata(
      'body',
      cell.row,
      cell.column
    );
    if (metadata) {
      this._metadataBasedOverrides.forEach(value => {
        if (!editorMatched) {
          let [identifier, editor] = value;
          if (this._metadataMatchesIdentifier(metadata, identifier)) {
            editorMatched = resolveOption(editor, cell);
          }
        }
      });
    }

    return editorMatched;
  }

  /**
   * Choose the most appropriate cell editor to use based on overrides / cell data type.
   *
   * If no match is found in overrides or based on cell data type, and if cell has a primitive
   * data type then TextCellEditor is used as default cell editor. If 'default' cell editor
   * is overridden, then it is used instead of TextCellEditor for default.
   */
  private _getEditor(cell: CellEditor.CellConfig): ICellEditor | undefined {
    const dtKey = this._getDataTypeKey(cell);

    // find an editor based on data type based override
    if (this._typeBasedOverrides.has(dtKey)) {
      const editor = this._typeBasedOverrides.get(dtKey);
      return resolveOption(editor!, cell);
    } // find an editor based on metadata match based override
    else if (this._metadataBasedOverrides.size > 0) {
      const editor = this._getMetadataBasedEditor(cell);
      if (editor) {
        return editor;
      }
    }

    // choose an editor based on data type
    switch (dtKey) {
      case 'string':
        return new TextCellEditor();
      case 'number':
        return new NumberCellEditor();
      case 'integer':
        return new IntegerCellEditor();
      case 'boolean':
        return new BooleanCellEditor();
      case 'date':
        return new DateCellEditor();
      case 'string:option':
      case 'number:option':
      case 'integer:option':
      case 'date:option':
      case 'array:option':
        return new OptionCellEditor();
      case 'string:dynamic-option':
      case 'number:dynamic-option':
      case 'integer:dynamic-option':
      case 'date:dynamic-option':
        return new DynamicOptionCellEditor();
    }

    // if an override exists for 'default', then use it
    if (this._typeBasedOverrides.has('default')) {
      const editor = this._typeBasedOverrides.get('default');
      return resolveOption(editor!, cell);
    }

    // if cell has a primitive data type then use TextCellEditor
    const data = cell.grid.dataModel!.data('body', cell.row, cell.column);
    if (!data || typeof data !== 'object') {
      return new TextCellEditor();
    }

    // no suitable editor found for the cell
    return undefined;
  }

  // active cell editor
  private _editor: ICellEditor | null = null;
  // active cell being edited
  private _cell: CellEditor.CellConfig | null = null;
  // cell editor overrides based on cell data type identifier
  private _typeBasedOverrides: Map<string, ICellEditor | Resolver> = new Map();
  // cell editor overrides based on partial metadata match
  private _metadataBasedOverrides: Map<
    string,
    [DataModel.Metadata, ICellEditor | Resolver]
  > = new Map();
}
