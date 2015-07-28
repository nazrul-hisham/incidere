define(['knockout'], function(ko) {
    ko.bindingHandlers.jsonTree = {
        init: function (element, valueAccessor) {
            var system = require(objectbuilders.system),
                value = valueAccessor(),
                entity = ko.unwrap(value.entity),
                searchbox = ko.unwrap(value.searchbox),
                member = value.selected,
                jsTreeData = {
                    text: entity.Name(),
                    state: {
                        opened: true,
                        selected: true
                    }
                },
                recurseChildMember = function (node) {
                    node.children = _(node.data.MemberCollection()).map(function (v) {
                        return {
                            text: v.Name(),
                            state: 'open',
                            type: v.TypeName(),
                            data: v
                        };
                    });
                    _(node.children).each(recurseChildMember);
                },
                loadJsTree = function () {
                    jsTreeData.children = _(entity.properties).map(function (v) {
                        return {
                            text: v.Name(),
                            state: 'open',
                            type: v.TypeName(),
                            data: v
                        };
                    });
                    _(jsTreeData.children).each(recurseChildMember);
                    $(element)
                        .on('select_node.jstree', function (node, selected) {
                            if (selected.node.data && typeof selected.node.data.Name === "function") {
                                member(selected.node.data);

                                // subscribe to Name change
                                member().Name.subscribe(function (name) {
                                    $(element).jstree(true)
                                        .rename_node(selected.node, name);
                                });
                                // type
                                member().TypeName.subscribe(function (name) {
                                    $(element).jstree(true)
                                        .set_type(selected.node, name);
                                });
                            }
                        })
                        .on('create_node.jstree', function (event, node) {
                            console.log(node, "node");
                        })
                        .on('rename_node.jstree', function (ev, node) {
                            var mb = node.node.data;
                            mb.Name(node.text);
                        })
                        .jstree({
                            "core": {
                                "animation": 0,
                                "check_callback": true,
                                "themes": { "stripes": true },
                                'data': jsTreeData
                            },
                            "contextmenu": {
                                "items": [
                                    {
                                        label: "Add Child",
                                        action: function () {
                                            var child = new bespoke.sph.domain.Member({ WebId: system.guid(), TypeName: 'System.String, mscorlib', Name: 'Member_Name' }),
                                                parent = $(element).jstree('get_selected', true),
                                                mb = parent[0].data,
                                                newNode = { state: "open", type: "System.String, mscorlib", text: 'Member_Name', data: child };

                                            child.$type = ko.observable('Bespoke.Sph.Integrations.Adapters.RegexMember, http.adapter');
                                            child.Pattern = ko.observable();
                                            child.Group = ko.observable();
                                            child.DateFormat = ko.observable();
                                            child.NumberFormat = ko.observable();

                                            var ref = $(element).jstree(true),
                                                sel = ref.get_selected();
                                            if (!sel.length) {
                                                return false;
                                            }
                                            sel = sel[0];
                                            sel = ref.create_node(sel, newNode);
                                            if (sel) {
                                                ref.edit(sel);
                                                if (mb && mb.MemberCollection) {
                                                    mb.MemberCollection.push(child);
                                                } else {
                                                    entity.MemberCollection.push(child);
                                                }
                                                return true;
                                            }
                                            return false;


                                        }
                                    },
                                    {
                                        label: "Remove",
                                        action: function () {
                                            var ref = $(element).jstree(true),
                                                sel = ref.get_selected();

                                            // now delete the member
                                            var n = ref.get_selected(true)[0],
                                                p = ref.get_node($('#' + n.parent)),
                                                parentMember = p.data;
                                            if (parentMember && typeof parentMember.MemberCollection === "function") {
                                                var child = _(parentMember.MemberCollection()).find(function (v) {
                                                    return v.WebId() === n.data.WebId();
                                                });
                                                parentMember.MemberCollection.remove(child);
                                            } else {
                                                var child2 = _(entity.MemberCollection()).find(function (v) {
                                                    return v.WebId() === n.data.WebId();
                                                });
                                                entity.MemberCollection.remove(child2);
                                            }

                                            if (!sel.length) {
                                                return false;
                                            }
                                            ref.delete_node(sel);

                                            return true;

                                        }
                                    }
                                ]
                            },
                            "types": {

                                "System.String, mscorlib": {
                                    "icon": "glyphicon glyphicon-bold",
                                    "valid_children": []
                                },
                                "System.DateTime, mscorlib": {
                                    "icon": "glyphicon glyphicon-calendar",
                                    "valid_children": []
                                },
                                "System.Int32, mscorlib": {
                                    "icon": "fa fa-sort-numeric-asc",
                                    "valid_children": []
                                },
                                "System.Decimal, mscorlib": {
                                    "icon": "glyphicon glyphicon-usd",
                                    "valid_children": []
                                },
                                "System.Boolean, mscorlib": {
                                    "icon": "glyphicon glyphicon-ok",
                                    "valid_children": []
                                },
                                "System.Object, mscorlib": {
                                    "icon": "fa fa-building-o"
                                },
                                "System.Array, mscorlib": {
                                    "icon": "glyphicon glyphicon-list"
                                }
                            },
                            "plugins": ["contextmenu", "dnd", "types", "search"]
                        });
                };
            loadJsTree();

            var to = false;
            $(searchbox).keyup(function () {
                if (to) {
                    clearTimeout(to);
                }
                to = setTimeout(function () {
                    var v = $(searchbox).val();
                    $(element).jstree(true).search(v);
                }, 250);
            });

        }
    };

    ko.bindingHandlers.functoidPopover = {
        init: function (element, valueAccessor) {

            var div = $(element),
                functoid = ko.unwrap(valueAccessor()),
                uid = ko.unwrap(functoid.WebId),
                fullName = typeof functoid.$type === "function" ? functoid.$type() : functoid.$type,
                name = /(.*?),/.exec(fullName)[1],
                td = ko.dataFor(div.parent()[0]),
                pop = div.popover({
                    title: name + ' : ' + ko.unwrap(functoid.Name),
                    html: true,
                    trigger : 'manual',
                    content: function () {
                        $('a.edit-functoid').popover('hide');
                        return  '   <div class="context-menu">'+
                                '       <a class="edit-functoid '+  uid +'" title="edit functoid" href="#">'+
                                '           <i class="fa fa-edit fa-2x"></i>'+
                                '       </a>'+
                                '       <a class="delete-functoid '+ uid+'" href="#" title="remove functoid">'+
                                '           <i class="fa fa-times-circle fa-2x"></i>'+
                                '       </a>'+
                                '   </div>';
                    }
                });

            div.mousedown( function(e){
                if(e.button == 2){
                    e.preventDefault();
                    div.popover('toggle');

                    return false;
                }
            }).bind("contextmenu", function(){return false;});
            // just display it for 5 seconds
            pop.on('shown.bs.popover', function () {
                setTimeout(function () { pop.popover('hide'); }, 5000);
            });

            $(document).on('click', 'a.' + functoid.WebId(), function (e) {
                e.preventDefault();
                pop.popover('hide');
                var app = require(objectbuilders.app),
                    link = $(this);
                if (link.hasClass("delete-functoid")) {
                    app.showMessage("Are you sure you want to remove this functoid, please remove all the connection before proceed", "Remove functoid", ["Yes", "No"])
                        .done(function (result) {
                            if (result === "Yes") {
                                td.FunctoidCollection.remove(functoid);
                            }
                        });
                }
                if (link.hasClass("edit-functoid")) {
                    var context = require(objectbuilders.datacontext),
                        clone = context.toObservable(ko.mapping.toJS(functoid));
                    var type = ko.unwrap(functoid.$type).toLowerCase();

                    require(['viewmodels/functoid.' + type , 'durandal/app'], function (dialog, app2) {
                        dialog.functoid(clone);

                        app2.showDialog(dialog)
                            .done(function (result) {
                                $('div.modalBlockout,div.modalHost').remove();
                                if (!result) return;
                                if (result === "OK") {
                                    for (var g in functoid) {
                                        if (typeof functoid[g] === "function" && (functoid[g].name === "c" || functoid[g].name === "observable")) {
                                            functoid[g](ko.unwrap(clone[g]));
                                        } else {
                                            functoid[g] = clone[g];
                                        }
                                    }
                                }
                            });

                    });
                }
            });
        }
    };


});