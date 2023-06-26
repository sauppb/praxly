import { tree2blocks } from "./tree2blocks";



export const tree2text = (blockjson, indentation=0) => {
    
    // try {
        console.log(blockjson.type);
    // }
    // catch (error) {
    //     console.error('An error occurred: could not generate code for the nested block', error);
    //     return "";
    // }
    switch(blockjson.type) {
        case 'INT':
        case 'BOOLEAN':
            try {
                return  blockjson.value.toString();
            }
            catch (error){
                return " ";
            }
        case "VARIABLE":
            try {
                return  blockjson.name.toString();
            }
            catch (error){
                return " ";
            }
        case 'STRING':
            try {
                return  '\"' + blockjson.value + '\"';
            }
            catch (error){
                return " ";
            }
        
        case 'ADD':    
            return  tree2text(blockjson.left, indentation) + " + " + tree2text(blockjson.right, indentation);
        case 'SUBTRACT':
            return  tree2text(blockjson.left, indentation) + " - " + tree2text(blockjson.right, indentation);
        case 'MULTIPLY':
            return  tree2text(blockjson.left, indentation) + " * " + tree2text(blockjson.right, indentation);
        case 'DIVIDE':
            return  tree2text(blockjson.left, indentation) + " / " + tree2text(blockjson.right, indentation);
        case 'EXPONENT':
            return  tree2text(blockjson.left, indentation) + " ^ " + tree2text(blockjson.right, indentation);
        case 'MOD':
            return  tree2text(blockjson.left, indentation) + " % " + tree2text(blockjson.right, indentation);
        case 'AND':
            return  tree2text(blockjson.left, indentation) + " and " + tree2text(blockjson.right, indentation);
        case 'OR':
            return  tree2text(blockjson.left, indentation) + " or " + tree2text(blockjson.right, indentation);
        case 'EQUALS':
            return  tree2text(blockjson.left, indentation) + " == " + tree2text(blockjson.right, indentation);
        case 'LESS_THAN_EQUAL':
            return  tree2text(blockjson.left, indentation) + " < " + tree2text(blockjson.right, indentation);
        case 'GREATER_THAN_EQUAL':
            return  tree2text(blockjson.left, indentation) + " >= " + tree2text(blockjson.right, indentation);
        case 'GREATER_THAN':
            return  tree2text(blockjson.left, indentation) + " <= " + tree2text(blockjson.right, indentation);
        case 'LESS_THAN':
            return  tree2text(blockjson.left, indentation) + " < " + tree2text(blockjson.right, indentation);
        case 'NOT_EQUAL':
            return  tree2text(blockjson.left, indentation) + " ≠ " + tree2text(blockjson.right, indentation);   
        case 'PRINT':
            return  '\t'.repeat(indentation) + "print " +  tree2text(blockjson.value, indentation);        
        case 'PROGRAM': 
            return tree2text(blockjson.value);   
        case 'STATEMENT':
            return  tree2text(blockjson.value, indentation);
        case 'CODEBLOCK':
            var statements = blockjson.statements.map(element => {
                try {
                    return tree2text(element, indentation);
                } 
                catch (error) {
                    console.error('An error occurred: empty statement', error);
                    return null;
                }
                
            });
            
            return statements.join('\n') + '\n';
        case 'IF':
            return '\t'.repeat(indentation) + "if (" + tree2text(blockjson.condition, indentation) + ")\n" 
            + '\t'.repeat(indentation) + tree2text(blockjson.statement, indentation + 1) 
            + '\t'.repeat(indentation) +'end if';
        case 'IF_ELSE':
            return "if (" + tree2text(blockjson.condition) + ")\n" 
                 + '\t'.repeat(indentation) + tree2text(blockjson.statement, indentation + 1) + '\n' 
                 + '\t'.repeat(indentation) +'\else\n' 
                 + '\t'.repeat(indentation) + tree2text(blockjson.alternative, indentation + 1) 
                 + '\t'.repeat(indentation) +'end if';

        case 'ASSIGNMENT':
            if (blockjson.varType === 'reassignment') {
                try {
                    return  blockjson.name.toString() + ' = ' + tree2text(blockjson.value);
                }
                catch (error){
                    return " ";
                }
            } else {
                try {
                    return blockjson.varType.toString().substring(7) + ' ' +  blockjson.name.toString() + ' = ' + tree2text(blockjson.value);
                }
                catch (error){
                    return " ";
                }
            }
        case 'WHILE':
            return '\t'.repeat(indentation) + "while (" + tree2text(blockjson.condition, indentation) + ")\n" 
            + '\t'.repeat(indentation) + tree2text(blockjson.statement, indentation + 1) 
            + '\t'.repeat(indentation) +'end while';

        case 'DO_WHILE':
            return '\t'.repeat(indentation) + 'do\n'  
            + '\t'.repeat(indentation) + tree2text(blockjson.statement, indentation + 1) 
            + '\t'.repeat(indentation) + "while (" + tree2text(blockjson.condition, indentation) + ")\n" ;
            
        case 'REPEAT_UNTIL':
            return '\t'.repeat(indentation) + 'repeat\n' 
            + '\t'.repeat(indentation) + tree2text(blockjson.statement, indentation + 1) 
            + '\t'.repeat(indentation) + "until (" + tree2text(blockjson.condition, indentation) + ")\n" ;
        case 'NOT':
            return  "not " +  tree2text(blockjson.value, indentation); 
        case 'FOR':
            return '\t'.repeat(indentation) + "for (" + tree2text(blockjson.initialization, indentation) + '; '
            + tree2text(blockjson.condition, indentation) + '; ' + tree2text(blockjson.incriment, indentation) +")\n" 
            + '\t'.repeat(indentation) + tree2text(blockjson.statement, indentation + 1) 
            + '\t'.repeat(indentation) +'end for';
    }
}
