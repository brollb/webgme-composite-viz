define([
], function() {
    return {
        "visualizerDefs": {
            "PartBrowser": "js/Panels/PartBrowser/PartBrowserPanel",
            "PropertyEditor": "js/Panels/PropertyEditor/PropertyEditorPanel",
            "ObjectBrowser": "js/Panels/ObjectBrowser/ObjectBrowserPanel",
            "ModelEditor": "js/Panels/ModelEditor/ModelEditorPanel"
        },
        "config": {
            "type": "row",
            "content": [
                {
                    "type": "component",
                    "componentName": "PartBrowser",
                    "title": "Part Browser",
                    "width": 15,
                    "height": 100,
                    "id": "PartBrowser",
                    "isClosable": false
                },
                {
                    "type": "component",
                    "componentName": "ModelEditor",
                    "title": "Composition",
                    "width": 70,
                    "height": 100,
                    "id": "ModelEditor",
                    "isClosable": false
                },
                {
                    "type": "column",
                    "width": 15,
                    "height": 100,
                    "content": [
                        {
                            "type": "component",
                            "componentName": "ObjectBrowser",
                            "title": "Tree Browser",
                            "width": 100,
                            "height": 50,
                            "id": "TreeBrowser",
                            "isClosable": false
                        },
                        {
                            "type": "component",
                            "componentName": "PropertyEditor",
                            "title": "Property Editor",
                            "width": 100,
                            "height": 50,
                            "id": "PropertyEditor",
                            "isClosable": false
                        }
                    ]
                }
            ]

        }
    };
});
