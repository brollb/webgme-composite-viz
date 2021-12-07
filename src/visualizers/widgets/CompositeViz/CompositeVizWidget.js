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

            this._registeredComponentTypes = [];
            this.initialize(this.layout, panelArgs);
            this._logger.debug('ctor finished');
        }

        getComponentId() {
            return 'CompositeViz';
        }

        async initialize(layout, args) {
            this.$el.addClass(WIDGET_CLASS);
            const {visualizers} = this.getComponentConfig();
            const registrations = visualizers
                .filter(vizConfig => !this.isRegistered(vizConfig))
                .map(vizConfig => this.registerVisualizer(layout, vizConfig, args));
            await Promise.all(registrations);

            const contentItems = visualizers.map(vizConfig => {
                const {panel, layoutConfig} = vizConfig;
                const itemConfig = Object.assign({},
                    {type: 'component', componentName: panel}, layoutConfig);

                return itemConfig;
            });

            layout.root.addChild({
                type: 'row',
                content: contentItems,
            });
        }

        getComponentConfig() {
            const config = ComponentSettings.resolveWithWebGMEGlobal(
                {},
                this.getComponentId(),
            );
            // TODO: add assertions here
            return config;
        }

        async registerVisualizer(layout, vizConfig, args) {
            const {panel} = vizConfig;
            this._registeredComponentTypes.push(panel);

            const EditorPanel = await this.require(panel);
            const Class = MakeVisualizerClass(EditorPanel, args)
            layout.registerComponent(
                panel,
                Class
            );
        }

        require(path) {
            return new Promise((resolve, reject) => require([path], resolve, reject));
        }

        isRegistered(vizConfig) {
            const {panel} = vizConfig;
            return this._registeredComponentTypes.includes(panel);
        }

        onWidgetContainerResize (/*width, height*/) {
            this._logger.debug('Widget is resizing...');
        }

        /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
        destroy () {
            console.log('destroy');
        }

        onActivate () {
            this._logger.debug('CompositeVizWidget has been activated');
        }

        onDeactivate () {
            this._logger.debug('CompositeVizWidget has been deactivated');
        }
    }

    function MakeVisualizerClass(Editor, args) {
        return class VisualizerClass extends VisualizerComponent {
            constructor(container, state) {
                const editor = new Editor(...args);
                super(container, editor);
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
            this.editor.onResize(this.editor.$el.width(), this.editor.$el.height());
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

    return CompositeVizWidget;
});
