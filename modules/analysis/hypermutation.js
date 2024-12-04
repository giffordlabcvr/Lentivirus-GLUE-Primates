function hypermutation(refsequence, refname, alignment, feature){
	
	var ref_seq = '';
	var info = [];
	
	
	// export alignment from GLUE
	glue.inMode("module/fastaAlignmentExporter", function(){	
			var sequences = glue.command(["export",alignment,"-r",refsequence,"-f",feature,"-a","-p"]);
			var list = sequences.nucleotideFasta.sequences;
			
			// loop through each sequence in the alignment to find reference sequence
			_.each(list, function(seq){			
				if (seq.id == refname ) {
					ref_seq = seq.sequence;
				}	
			});		
			
			// get total number of Gs in reference sequence
			numGs = 0
			for (var i=0; i < ref_seq.length; i++) {
				if (ref_seq.charAt(i) == 'G') {
					numGs++;
				}
			}
	
			// loop through each sequence in the alignment to compare with ref
			_.each(list, function(seq){	
				if (seq.id != refname) {
					
					GA = 0
					AG = 0
					diffs=0
					
					dint = {GG:0, GA:0, GC:0, GT:0};
				
					for (var i=0; i < ref_seq.length; i++) {
						
						var key = "pos_" + (i+1);
						var ref_base = ref_seq.charAt(i);
						var seq_base = seq.sequence.charAt(i);
						// count total number of differences
						if (ref_base != seq_base) {
							diffs++;
							// count ref G to seq A changes
							// increment dinucleotide context
							if (ref_base == 'G' && seq_base == 'A') {
								GA++;
								dint_context = ref_seq.charAt(i) + ref_seq.charAt(i+1);
								dint[dint_context]++;	
							// count ref A to seq G changes		
							} else if (ref_base == 'A' && seq_base == 'G') {
								AG++;
							}	
						}
					}
				}
				// generate ratio of G -> A / A -> G and calculate %Gs
				ratio = (GA/AG).toFixed(4);
				percGs =((GA/numGs) * 100).toFixed(2);
				// for the current sequence, store and return total num diffs from ref, G -> A changes,
				// A -> G changes, GA/AG ratio, %Gs and dinucleotide context counts		
				info.push({
					sequence: seq.id,
					total_diffs: diffs,
					GtoA: GA,
					AtoG: AG,
					ratio: ratio,
					percGs: percGs,
					GG: dint['GG'],
					GA: dint['GA'],
					GC: dint['GC'],
					GT: dint['GT']
				});
			
			});	
	});
	return info;	
}