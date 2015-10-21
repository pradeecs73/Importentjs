"use strict";

define([],
    function () {

        var g = { nodes: [], edges: [] };
        g.nodes.push({
            id: 'Receive',
            label: 'Receive',
            x: 0,
            y: 0,
            size: 100
        });

        g.nodes.push({
            id: 'Save',
            label: 'Save',
            x: -3,
            y: 1,
            size: 100
        });

        g.nodes.push({
            id: 'Remove',
            label: 'Remove',
            x: 1,
            y: 1,
            size: 100
        });

        g.nodes.push({
            id: 'Save_Index',
            label: 'Index',
            x: -1,
            y: 2,
            size: 100
        });
        g.nodes.push({
            id: 'Remove_Index',
            label: 'Index',
            x: 1,
            y: 2,
            size: 100
        });

        g.nodes.push({
            id: 'Transform',
            label: 'Transform',
            x: -5,
            y: 2,
            size: 100
        });

        g.nodes.push({
            id: 'Reader_Index',
            label: 'Reader-Index',
            x: -4,
            y: 3,
            size: 100
        });
        g.nodes.push({
            id: 'Reader_Deliver',
            label: 'Reader-Deliver',
            x: -6,
            y: 3,
            size: 100
        });
        g.nodes.push({
            id: 'Transform_Cleanup',
            label: 'Transform-Local-Cleanup',
            x: -5,
            y: 4,
            size: 100
        });

        g.edges.push({
            id: "Receive-Save",
            source: "Receive",
            target: "Save",
            type: ['arrow'],
            color: '#000000'
        });
        g.edges.push({
            id: "Receive-Remove",
            source: "Receive",
            target: "Remove",
            type: ['arrow'],
            color: '#000000'
        });
        g.edges.push({
            id: "Remove-Index",
            source: "Remove",
            target: "Remove_Index",
            type: ['arrow'],
            color: '#000000'
        });

        g.edges.push({
            id: "Save-Index",
            source: "Save",
            target: "Save_Index",
            type: ['arrow'],
            color: '#000000'
        });
        g.edges.push({
            id: "Save-Transform",
            source: "Save",
            target: "Transform",
            type: ['arrow'],
            color: '#000000'
        });
        g.edges.push({
            id: "Transform-Reader_Index",
            source: "Transform",
            target: "Reader_Index",
            type: ['arrow'],
            color: '#000000'
        });
        g.edges.push({
            id: "Transform-Reader_Deliver",
            source: "Transform",
            target: "Reader_Deliver",
            type: ['arrow'],
            color: '#000000'
        });
        g.edges.push({
            id: "Reader_Deliver_Transform_Cleanup",
            source: "Reader_Deliver",
            target: "Transform_Cleanup",
            type: ['arrow'],
            color: '#000000'
        });
        g.edges.push({
            id: "Reader_Index_Transform_Cleanup",
            source: "Reader_Index",
            target: "Transform_Cleanup",
            type: ['arrow'],
            color: '#000000'
        });


        return g;
    });