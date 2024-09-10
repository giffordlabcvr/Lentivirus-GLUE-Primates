
// list the sequences in source ncbi-refseqs-hiv-1
var listSeqResult = glue.command(["list", "sequence", "-w", "source.name = 'ncbi-refseqs-hiv-1'"]);

// extract from the result a list of sequence IDs.
var seqIds = glue.getTableColumn(listSeqResult, "sequenceID");

// for each sequence ID
_.each(seqIds, function(seqId) {
    
    // create an object in the custom table which uses the sequence ID as the row ID.
    glue.command(["create", "custom-table-row", "isolate_data", seqId]);
    
    // associate the corresponding sequence with this object.
    glue.inMode("sequence/ncbi-refseqs-hiv-1/"+seqId, function() {
        glue.command(["set", "link-target", "isolate_data", "custom-table-row/isolate_data/"+seqId]);
    });

	glue.inMode("sequence/ncbi-refseqs-hiv-1/"+seqId, function() {
		
		glue.command(["set", "field", "subgenus", 'hiv-1']);
		
	});

});
