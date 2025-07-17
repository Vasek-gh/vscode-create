# Documentation for vscode-create extension

## How its work

todo

### Quickpick dialog

todo

### Templates

todo

## Configuration

todo

### Schema

```
"configuration": {
    "title": "vscode new",
    "properties": {
        "vscode-create.csharp.enable": {
            "type": "boolean",
            "default": true,
            "description": "Enable C# features"
        },
        "vscode-create.extensions": {
            "type": "object",
            "description": "Sets custom extensions configuration",
            "scope": "resource",
            "additionalProperties": {
                "type": "object",
                "properties": {
                    "default": {
                        "type": "string"
                    }
                },
                "additionalProperties": {
                    "type": "object",
                    "properties": {
                        "hidden": {
                            "type": "boolean"
                        },
                        "vars": {
                            "type": "object"
                        },
                        "template": {
                            "anyOf": [
                                {
                                    "type": "string"
                                },
                                {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "extension": {
                                                "type": "string"
                                            },
                                            "template": {
                                                "type": "string"
                                            }
                                        },
                                        "required": [
                                            "extension",
                                            "template"
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    "required": [
                        "template"
                    ],
                    "additionalProperties": false
                }
            }
        }
    }
},
```

### Examples

todo

## Some problems

* Unfortunately, VS Code extensions API does not allow you to get the currently focused element from the explorer in the extension. There is a [issue](https://github.com/microsoft/vscode/issues/3553) in VS Code repository that has been hanging for 9 years. To solve this problem, a hack was proposed that recognizes the selected element by calling the "Copy path" command. But this command has a bug. If the current focus in the explorer does not point to any element, the command will return the wrong focus. For this extension, this means that when the explorer does not have focus, the file creation will not occur exactly in the place you expect.
* Currently, VS Code extensions API for [Quick Picks](https://code.visualstudio.com/api/ux-guidelines/quick-picks) does not allow to process hot keys such as or Ctrl+Enter. Therefore, it is not possible to implement the usual behavior for batching operations. For example, when Ctrl+Enter adds something without closing the dialog
* Also, at the moment, the VS Code extensions API for Quick Picks has not yet stabilized the [API](https://github.com/microsoft/vscode/issues/73904) for disabling sorting by default. Moreover, the API itself seems to be ready, but for an unknown reason the team does not release it. Therefore, many extensions (like this extension) have to use the hack `(this.quickPick as any).sortByLabel = false;`. Unfortunately, the VS Code team can change the implementation and this will lead to the breakage of this extension.
