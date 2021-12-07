/*globals define, WebGMEGlobal*/

define([
    'js/Constants',
    'js/Utils/GMEConcepts',
    'js/NodePropertyNames',
], function (
    CONSTANTS,
    GMEConcepts,
    nodePropertyNames,
) {

    'use strict';

    class CompositeVizControl {
        constructor(options) {

            this._logger = options.logger.fork('Control');

            this._client = options.client;

            // Initialize core collections and variables
            this._widget = options.widget;

            this._currentNodeId = null;
            this._currentNodeParentId = undefined;

            this.editors = [];
            this._logger.debug('ctor finished');
        }

        /* * * * * * * * Visualizer content update callbacks * * * * * * * */
        selectedObjectChanged(nodeId) {
            this._currentNodeId = nodeId;
        }

        _stateActiveObjectChanged(model, activeObjectId) {
            if (this._currentNodeId === activeObjectId) {
                // The same node selected as before - do not trigger
            } else {
                this.selectedObjectChanged(activeObjectId);
            }
        }

        /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
        destroy() {
            this._detachClientEventListeners();
            this.editors.forEach(editor => editor.destroy());
        }

        _attachClientEventListeners() {
            this._detachClientEventListeners();
            WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this);
        }

        _detachClientEventListeners() {
            WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged);
        }

        onActivate() {
            if (!this._embedded) {
                this._attachClientEventListeners();

                if (typeof this._currentNodeId === 'string') {
                    WebGMEGlobal.State.registerActiveObject(this._currentNodeId, {suppressVisualizerFromNode: true});
                }
            }
            this.editors.forEach(editor => editor.onActivate());
        }

        onDeactivate() {
            if (!this._embedded) {
                this._detachClientEventListeners();
            }
            this.editors.forEach(editor => editor.onDeactivate());
        }
    }

    return CompositeVizControl;
});
