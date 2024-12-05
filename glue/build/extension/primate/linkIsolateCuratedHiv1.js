// Array of configurations for the different sequence groups
var sequenceConfigs = [
    { sourceName: 'ncbi-curated-primate-subtype-a', subtype: 'A' },
    { sourceName: 'ncbi-curated-primate-subtype-b', subtype: 'B' },
    { sourceName: 'ncbi-curated-primate-subtype-c', subtype: 'C' },
    { sourceName: 'ncbi-curated-primate-subtype-d', subtype: 'D' },
    { sourceName: 'ncbi-curated-primate-subtype-f1', subtype: 'F1' },
    { sourceName: 'ncbi-curated-primate-subtype-g', subtype: 'G' },
    { sourceName: 'ncbi-curated-primate-crf01', subtype: 'CRF01' },
    { sourceName: 'ncbi-curated-primate-crf02', subtype: 'CRF02' },
    { sourceName: 'ncbi-curated-primate-group-n', clade: 'N', subtype: 'NULL' },
    { sourceName: 'ncbi-curated-primate-group-o', clade: 'O', subtype: 'NULL' },
    { sourceName: 'ncbi-curated-primate-group-p', clade: 'P', subtype: 'NULL' }
];

// Loop through each configuration
_.each(sequenceConfigs, function(config) {
    // List the sequences from the specified source
    var listSeqResult = glue.command(["list", "sequence", "-w", "source.name = '" + config.sourceName + "'"]);

    // Extract a list of sequence IDs
    var seqIds = glue.getTableColumn(listSeqResult, "sequenceID");

    // Process each sequence ID
    _.each(seqIds, function(seqId) {
        // Create an object in the custom table using the sequence ID as the row ID
        glue.command(["create", "custom-table-row", "isolate_data", seqId]);

        // Associate the corresponding sequence with this object
        glue.inMode("sequence/" + config.sourceName + "/" + seqId, function() {
            glue.command(["set", "link-target", "isolate_data", "custom-table-row/isolate_data/" + seqId]);
        });

        // Set fields in the sequence object
        glue.inMode("sequence/" + config.sourceName + "/" + seqId, function() {
            glue.command(["set", "field", "subgenus", 'Primate']);
            glue.command(["set", "field", "species", 'HIV-1']);
            glue.command(["set", "field", "clade", config.clade || 'M']); // Default clade is 'M'
            glue.command(["set", "field", "subtype", config.subtype]);
        });
    });
});
