/*globals define, $ */

define([
    './lib/golden-layout-1.5.9/dist/goldenlayout',
    'js/Utils/ComponentSettings',
    'css!./lib/golden-layout-1.5.9/src/css/goldenlayout-base.css',
    'css!./lib/golden-layout-1.5.9/src/css/goldenlayout-light-theme.css',
    'css!./styles/CompositeVizWidget.css',
], function (
    GoldenLayout,
    ComponentSettings,
) {
    'use strict';

    const WIDGET_CLASS = 'composite-viz';

    class CompositeVizWidget {
        constructor(logger, container, panelArgs) {
            this._logger = logger.fork('Widget');
            console.log({panelArgs});
            this.$el = container;
            const config = {
                settings: {
                    showPopoutIcon: false,
                },
                content: []
            };
            this.layout = new GoldenLayout(config, this.$el);
            this.layout.on('itemDestroyed', component => {
                if (component.instance instanceof VisualizerComponent) {
                    component.instance.destroy();
                }
            });
            this.layout.init();

            this.editors = [];
            this._currentNodeId = null;
            this._registeredComponentTypes = [];
            this.initialize(this.layout, panelArgs);
            this._logger.debug('ctor finished');
        }

        getComponentId() {
            return 'CompositeViz';
        }

        async initialize(layout, args) {
            this.$el.addClass(WIDGET_CLASS);
            const {visualizerDefs, config} = this.getComponentConfig();
            console.log({config});
            const registrations = Object.entries(visualizerDefs)
                .filter(([name, path]) => !this.isRegistered(name))
                .map(([name, path]) => this.registerVisualizer(layout, name, path, args));
            await Promise.all(registrations);

            layout.root.addChild(config);

            if (this._currentNodeId !== undefined) {
                WebGMEGlobal.State.registerActiveObject(null, {silent: true});
                WebGMEGlobal.State.registerActiveObject(this._currentNodeId, {suppressVisualizerFromNode: true});
            }
        }

        selectedObjectChanged(nodeId) {
            this._currentNodeId = nodeId;
        }

        getComponentConfig() {
            const config = ComponentSettings.resolveWithWebGMEGlobal(
                {},
                this.getComponentId(),
            );
            // TODO: add assertions here
            return deepCopy(config);
        }

        async registerVisualizer(layout, name, panelPath, args) {
            this._registeredComponentTypes.push(name);

            const EditorPanel = await this.require(panelPath);
            const Class = MakeVisualizerClass(this.editors, EditorPanel, args)
            layout.registerComponent(
                name,
                Class
            );
        }

        require(path) {
            return new Promise((resolve, reject) => require([path], resolve, reject));
        }

        isRegistered(name) {
            return this._registeredComponentTypes.includes(name);
        }

        onReadOnlyChanged (readOnly) {
            this.editors.forEach(editor => editor.onReadOnlyChanged(readOnly));
        }

        onWidgetContainerResize (width, height) {
            this._logger.debug('Widget is resizing...');
            //this.editors.forEach(editor => editor.onResize(width, height));
        }

        /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
        destroy () {
            this.editors.forEach(editor => editor.destroy());
        }

        onActivate () {
            this._logger.debug('CompositeVizWidget has been activated');
            console.log('CompositeVizWidget has been activated');
            this.editors.forEach(({editor}) => editor.onActivate());
        }

        onDeactivate () {
            this._logger.debug('CompositeVizWidget has been deactivated');
            console.log('CompositeVizWidget has been deactivated');
            this.editors.forEach(({editor}) => editor.onDeactivate());
        }
    }

    function MakeVisualizerClass(registry, Editor, args) {
        return class VisualizerClass extends VisualizerComponent {
            constructor(container, state) {
                const editor = new Editor(...args);

                // workaround since editor sizes don't adapt by default in webgme...
                editor.$el.css('height', '100%');
                editor.$el.css('width', '100%');

                super(container, editor);
                registry.push(this);
            }

            destroy() {
                const index = registry.indexOf(this);
                if (index > -1) {
                    registry.splice(index, 1);
                }
                super.destroy();
            }
        };
    }

    class VisualizerComponent {
        constructor(container, editor) {
            container.getElement().append(editor.$el);
            this.editor = editor;
            container.on('resize', () => this.onResize());
        }

        destroy() {
            this.editor.destroy();
        }

        onResize() {
            const width = this.editor.$el.parent().width();
            const height = this.editor.$el.parent().height();
            this.editor.onResize(width, height);
        }
    }

    class WelcomeComponent {
        constructor(container/*, state*/) {
            const element = $('<div>', {class: 'welcome'});
            element.text('No visualizers defined in config...');
            container.getElement().append(element);
        }

        destroy() {
        }
    }

    function deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    return CompositeVizWidget;
});
