# webgme-composite-viz
This is a [WebGME](https://webgme.org) visualizer for composing visualizers from existing visualizers (using [GoldenLayout](https://golden-layout.com/)).

## Installation
First, install the webgme-consolidated-viz following:
- [NodeJS](https://nodejs.org/en/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/)

Second, start mongodb locally by running the `mongod` executable in your mongodb installation (you may need to create a `data` directory or set `--dbpath`).

Then, run `webgme start` from the project root to start . Finally, navigate to `http://localhost:8080` to start using webgme-consolidated-viz!

## Usage
First, enable the composite visualizer for a given node. Then click on it in the visualizers panel (assuming default WebGME UI).

## Configuration
The visualizer can be configured using component settings from WebGME (ie, [config/components.json](./config/components.json)). There are 2 fields: `visualizerDefs` and `config`. The former is a mapping of names to requireJS paths used by WebGME. The latter is a GoldenLayout [configuration](http://golden-layout.com/docs/Config.html) for the visualizer which supports the keys from `visualizerDefs` as values for `componentName`.

## Multiple Configurations (eg, for different node types)
This would be cool. Ideally, this would not be defined in the component settings since those require access to the deployment (not great for customization with different domain models). Ideally, nodes could reference a view-model of sorts that would define this configuration.
