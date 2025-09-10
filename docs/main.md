# Documentation for vscode-create extension

## How its work

todo

### Quickpick dialog

todo

## Configuration

Configuration is done in the [standard way](https://code.visualstudio.com/docs/configure/settings) for VS Code. Below are all possible settings of this extension:

| Section  | Description |
| ------------- | ------------- |
| vscode-create.extensions  | Sets custom extensions configuration. [Description.](#Extensions-section) |
| vscode-create.csharp.enable  | Enable C# features  |


### Extensions section

Section  containing templates for different types of file extensions. Each element of this object contains a setting for a specific extension. The key is used to determine which extension the configuration is created for.
```
"vscode-create.extensions": {
    // This section will be used to configure the txt extension
    "txt": {
        // templates list section body
    },
    // This section will be used to configure the json extension
    "json": {
        // template list section body
    }
}
```

#### Template list section

The extension templates section contains a list of templates that can be used to create a file with the specified extension. Each element (json object) in this list represents a setting for a specific template. The key specifies the name of the template and is also used for searching. In each section, you can also define which template will be used by default. If the default template is not specified, the first one from the list is selected.
```
"vscode-create.extensions": {
    // For files with the ext1 extension, two templates are specified. The first one will be used as default
    "ext1": {
        "template1": {
            "template": // template body section
        },
        "template2": {
            "template": // template body section
        }
    },
    // For files with the ext2 extension, two templates are specified. Template template2 will be used by default
    "ext2": {
        "default": "template2",
        "template1": {
            "template": // template body section
        },
        "template2": {
            "template": // template body section
        }
    }
}
```

#### Template body section
The template  body section contains the definition of the template itself and variables that can be declared specifically for that template.

The *template* section can be specified in three ways:
* *Simple string*. Can be used for trivial one-line templates. To create such a template, you need to specify ">>" at the beginning of the line.
* *File name*. It should be used when you need to create a complex template from one file.
* *List of templates*. It should be used when you want to create a "composite template". Such templates create several files at once in one operation. When creating several files, one name will be used, but with different extensions.
```
"vscode-create.extensions": {
    "json": {
        // This template use simple string
        "object_simple": {
            "template": ">>{}"
        },
        // This template use simple string
        "array_simple": {
            "template": ">>[]"
        }
        // This template use file name
        "object_file": {
            "template": "json_object.hbs"
        },
        // This template use file name
        "array_file": {
            "template": "json_array.hbs"
        }
        // This composite template
        "html": {
            "main": {
                "template": [
                    {
                        "extension": "html",
                        "template": "main_html.hbs"
                    },
                    {
                        "extension": "css",
                        "template": "main_html.hbs"
                    },
                    {
                        "extension": "js",
                        "template": "main_html.hbs"
                    }
                ]
            }
        },
    },
}
```
The *vars* section specifies variables that will be passed to the template engine to create a file. The section represents a set of objects whose keys will be used as variable names.
```
"vscode-create.extensions": {
    "ts": {
        "class": {
            "template": "ts.type.hbs", // for example file contains this text: export {{denull tsfile.type "class"}} {{file.baseName}} {}
            "vars": {
                "tsfile": {
                    "type": "class"
                }
            }
        },
        "interface": {
            "template": "ts.type.hbs",
            "vars": {
                "tsfile": {
                    "type": "interface"
                }
            }
        }
    },
}
```

#### Templates body

For templates, this extension uses the [Handlebars](https://github.com/handlebars-lang/handlebars.js?tab=readme-ov-file) library. Accordingly, to understand the syntax of templates, you need to read the _Handlebars_ documentation. The extension only adds variables that may be needed to create a file. There are variables that are always declared and there are those that can appear only in a certain context. To better understand how templates work, you can look at how the [templates](https://github.com/Vasek-gh/vscode-create/tree/main/templates) that come with this extension are implemented.

Mandatory variables have the following structure:
```
{
    workspaceDirectory
    time {
        utc,
        locale
    }
    file {
        fullName
        baseName
        fullDir
        baseDir
    }
}
```
This is an example of a template that outputs the value of all required variables:
```
{{workspaceDirectory}}
{{time.utc}}
{{time.locale}}
{{file.fullName}}
{{file.baseName}}
{{file.fullDir}}
{{file.baseDir}}
```

#### How template files are found

If the template file is specified without a full path, the search will be performed in turn in the following locations:

* The _.vscode/templates_ folder inside the current folder in which the dialog is called (if multi-root workspaces are not used, this will be your open root folder)
* The folder in which .code-workspace is located (if multi-root workspaces are used)
* The folder with templates from the extension

#### Full configuration schema
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

## Some problems

* Currently, VS Code extensions API for [Quick Picks](https://code.visualstudio.com/api/ux-guidelines/quick-picks) does not allow to process hot keys such as or Ctrl+Enter. Therefore, it is not possible to implement the usual behavior for batching operations. For example, when Ctrl+Enter adds something without closing the dialog
* Also, at the moment, the VS Code extensions API for Quick Picks has not yet stabilized the [API](https://github.com/microsoft/vscode/issues/73904) for disabling sorting by default. Moreover, the API itself seems to be ready, but for an unknown reason the team does not release it. Therefore, many extensions (like this extension) have to use the hack `(this.quickPick as any).sortByLabel = false;`. Unfortunately, the VS Code team can change the implementation and this will lead to the breakage of this extension.
