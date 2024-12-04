function calculateCodonChanges(refsequence, refname, alignment, feature) {

/*
	var refsequence = "REF_MASTER_B_AF033819";
	var refname = 'AF033819|HIV-1.M.B'
	var alignment   = "AL_HIV-1M_B";
	var feature = 'vif';
*/

	var aa_codons = {ATT:'I', ATC:'I', ATA:'I', CTT:'L', CTC:'L', CTA:'L', CTG:'L', TTA:'L', TTG:'L', GTT:'V', GTC:'V', GTA:'V', GTG:'V', TTT:'F', TTC:'F', ATG:'M', TGT:'C', TGC:'C', GCT:'A', GCC:'A', GCA:'A', GCG:'A', GGT:'G', GGC:'G', GGA:'G', GGG:'G', CCT:'P', CCC:'P', CCA:'P', CCG:'P', ACT:'T', ACC:'T', ACA:'T', ACG:'T', TCT:'S', TCC:'S', TCA:'S', TCG:'S', AGT:'S', AGC:'S', TAT:'Y', TAC:'Y', TGG:'W', CAA:'Q', CAG:'Q', AAT:'N', AAC:'N', CAT:'H', CAC:'H', GAA:'E', GAG:'E', GAT:'D', GAC:'D', AAA:'K', AAG:'K', CGT:'R', CGC:'R', CGA:'R', CGG:'R', AGA:'R', AGG:'R', TAA:'*', TAG:'*', TGA:'*'};
	var nt_codes = {A:'A', G:'G', C:'C', T:'T', N:['G','A','C','T'], B:['C', 'G', 'T'], D:['A', 'G', 'T'], H:['A','C','T'], V:['A', 'C', 'G'], K:['G', 'T'], Y:['C','T'], S:['C', 'G'], W:['A', 'T'], R:['A', 'G'], M:['A', 'C']};

	var ref_seq = '';
	var codon_counts = {};
	var skip_seqs = [];
	var outputArray = [];

	// export alignment from GLUE
	glue.inMode("module/hivFastaAlignmentExporter", function(){	
		var sequences = glue.command(["export",alignment,"-r",refsequence,"-f",feature,"-a","-p"]);
		var list = sequences.nucleotideFasta.sequences;

		// loop through each sequence in the alignment to find reference sequence
		_.each(list, function(seq){			
			if (seq.id == refname ) {
				ref_seq = seq.sequence;
			}	
		});			
	    // loop through each sequence in the alignment and compare with ref
		_.each(list, function(seq){
			var position = 1;
			// loop through the current sequence in increments of 3
			for (var i=0; i < seq.sequence.length; i+=3) {
				var key = position;
		
				//get the codon for the sequence and reference at current position
				var seq_codon = seq.sequence.charAt(i) +seq.sequence.charAt(i+1) +seq.sequence.charAt(i+2);
				var ref_codon = ref_seq.charAt(i) + ref_seq.charAt(i+1) + ref_seq.charAt(i+2);
	
				//check if codon from current sequence matches the ref codon
				if (seq_codon != ref_codon) {	
			
					// check if codon is gap characters - remains in frame
					if (seq_codon == "---") {
						// skip this codon but continue through this sequence
						return true;
					// check if codon contains a gap character - possible frameshift
					} else if (seq_codon.indexOf('-') > -1) {
						// add sequence ID to list of skipped sequences and the position at which this occurs
						// then break out of loop for current sequence			
						skip_seqs.push({
							seq: seq.id,
							position: key
						});
						return false;
					} else {
						// split codon characters to handle ambiguity codes
						var bases = seq_codon.split("");
						var first = nt_codes[bases[0]];		
						var second = nt_codes[bases[1]];	
						var third = nt_codes[bases[2]];		
								
						var codon_options = [];
						// generate a list of all possible codons from the given characters
						_.each(first, function(fb){
							_.each(second, function(sb){
								_.each(third, function(tb){
						
									var option = fb+sb+tb;
									codon_options.push(option);
						
								});
							});
						});
						// if there are multiple codon options, get the corresponding aa for each of these
						if (codon_options.length > 1){
							// get corresponding aa for each codon option and add to array
							aa_options = [];
							_.each(codon_options, function(codon){
								var c_opt = aa_codons[codon];
								aa_options.push(c_opt);
								//glue.logInfo(seq.id + "\t" + key + "\t" + codon + "\t" + c_opt);	
							});
							// if there is only one valid aa option, set at this position
							if ( _.every(aa_options, function(aa) {return aa === aa_options[0]}) == true ){
								var seq_aa = aa_options[0];
							}
							else {
								// if multiple aa options are possible, skip this position
								return true;
							}
						}
						// if there is only one codon option, set the aa for this sequence at this position
						else {
							var seq_aa = aa_codons[codon_options[0]];
						}
					}				
					var ref_aa = aa_codons[ref_codon];
			
					// set/increment appropriate values for current position		
					var positionFreqs = codon_counts[key];
					if (positionFreqs == null) {
						positionFreqs = {S:0, NS:0, T:0};
						codon_counts[key] = positionFreqs;
					}
					// check if aa from current sequence matches the ref aa
					opt = ""
					if (seq_aa != ref_aa){
						// if no - increment counter for non-synonymous change
						opt = "NS";
					} else if (seq_aa == ref_aa) {
						//if yes - increment counter for synonymous change
						opt = "S";
					}
					positionFreqs[opt]++;
					positionFreqs["T"]++;
				}

				position++;
			}
		});
		codon = 0;
		_.each(codon_counts, function(pos) {
			outputArray.push({
				codon: codon+1,
				synonymous: pos['S'],
				nonsynonymous: pos['NS'],
				totalChanges: pos['T']
			});
			codon++;
		});		

	//glue.logInfo("skip_seqs", skip_seqs);
	});
	
	return outputArray;

}