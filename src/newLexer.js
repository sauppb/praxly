export class Token {
    constructor(type, text, line) {
       token_type = type;
       value = text;
       line = line
    }
  }


export const TokenTypes = {
  INT: "INT",
  FLOAT: "FLOAT",
  STRING: "STRING",
  DOUBLE: "DOUBLE",
  CHAR: "CHAR",
  BOOLEAN: "BOOLEAN",
  COMMENT: "COMMENT", 
  LONG_COMMENT: "LONG_COMMENT", 
  KEYWORD: "KEYWORD",
  TYPE: "TYPE",
  INDENTIFIER: "IDENTIFIER", 
  SYMBOL: "SYMBOL",
  EOF: "EOF",

};






export function tokenize(source) {
    let tokens = [];
    let index = 0;
    let token_so_far = "";
    let keywords = ["if", "else", "end", "print", "println", "for", "while", 'and', 'or', 'do', 'repeat', 'until', 'not', 'return'];
    let types = ['int', 'double', 'String', 'char', 'float', 'boolean', 'short', 'void', 'int[]'];
    let oneCharSymbols = ['+', '-', '*', '/', '=', '>', '<', ',', ';', '[', ']', '(', ')', '%', '≠']; 
    let twoCharOperators = ['==', '!=', '>=', '<=', '->'];

    let currentLine = 0;

                // These nested Helper functions will determine what the next character is
        function printTokens() {
            for (let tok of tokens) {
            console.log(`Token: ${tok.token_type}, Value: ${tok.value}`);
            }
        }

        function has_letter() {
            let a = source[index];
            return /^[A-Za-z]$/.test(a);
        }

        function has_letter() {
            let a = source[index];
            return /^[A-Za-z]$/.test(a);
        }

        function has(c) {
            return index < source.length && source[index] === c;
        }

        function hasNot(c) {
            return index < source.length && source[index] !== c;    
        }

        function has_ahead(c) {
            return index < source.length && source[index + 1] === c; 
        }

        function has_type(){
            return index < source.length &&  types.includes(source[index]);
        }

        function has_digit() {
            let a = source[index];
            return /^[0-9]+$/.test(a);
        }

        function has_digit() {
            let a = source[index];
            return /^[0-9]+$/.test(a);
        }

        function has_oneCharOp(){
            for (let c of oneCharSymbols){
                if (c === source[index]){
                    return true;
                }
            }
            return false;
        }

        function has_twoCharOp(){
            for (let c of twoCharOperators){
                if (c === source[index] + source[index + 1]){
                    return true;
                }
            }
            return false;
        }

        function capture() {
            token_so_far += source[index];
            index++;
        }



        function skip() {
            index++;
        }

        function emit_token(type){
            tokens.push({token_type: type, value: token_so_far, line: currentLine});
            token_so_far = "";
        }

        while (index < source.length){

            if (has('/') && has_ahead('/')){
                skip();
                skip();
                while(hasNot('\n')){
                   capture();
                }
                skip();
                emit_token(TokenTypes.COMMENT);
                currentLine++;
            } else if ( has_digit()) {
                while (has_digit()) {
                   capture();
                }
                if (has(".")) {
                   capture();
                  while (has_digit()) {
                     capture();
                  }
                   emit_token(TokenTypes.DOUBLE);
                } else {
                   emit_token(TokenTypes.INT);
                }
                //ignore tabs and whitespace
            } else if ( has(" ") || has('\t')) {
                skip();
            
            //ignore emptylines
            } else if (has('\n')){
                while (has('\n')){
                    capture();
                    currentLine++;
                }
                emit_token(TokenTypes.SYMBOL);
    
            } else if ( has('\'')){
             skip();
            if ( has_letter &&  has_ahead('\'')) {
               capture();
               skip();
               emit_token(TokenTypes.CHAR);
            } else {
            //   textError('lexing', 'invalid char. \n \tRemember chars start and end with a single quote mark (\').',stringStart,  i - 1);
            }

            } else if ( has("\"") ){
                 skip();
                while (hasNot("\"")) {
                     capture();
                }
                if ( has("\"")){
                 skip();
                 emit_token(TokenTypes.STRING);
                }
                else {
                // textError('lexing', 'looks like you didn\'t close your quotes on your String. \n \tRemember Strings start and end with a single or double quote mark (\' or \").',stringStart,  i - 1);
                }
            
            } else if ( has_letter()) {
                while ( has_letter() ||  has_digit() || has('_')) {
                   capture();
                }
      
                if ( token_so_far === "true" ||  token_so_far === "false") {
                   emit_token(TokenTypes.BOOLEAN);
                } else if ( token_so_far === 'end'){
                  while ( hasNot('\n')) {
                     capture();
                  }
                   emit_token( token_so_far);
                }
                else if (keywords.includes( token_so_far)) {
                   emit_token(TokenTypes.KEYWORD);  
                  
                } 
                else if ( types.includes( token_so_far)) {
                  
                   emit_token(TokenTypes.TYPE);  
                }
                 else {
                  if ( token_so_far !== ''){
                     emit_token(TokenTypes.INDENTIFIER);
    
                  }
    
                }
            


            }else if (has_twoCharOp()) {
                    capture();
                    capture();
                    emit_token(TokenTypes.SYMBOL);
            } else if (has_oneCharOp()){
                capture();
                emit_token(TokenTypes.SYMBOL);
            } else {
                // textError('lexing',  `invalid character \"${source[index] }\"`);
                skip();
                console.log("invalid character at index ", i);
        }

    }
    emit_token(TokenTypes.EOF);
    return tokens;
  
    
}

const nodeTypes = {
    BLOCK: "BLOCK", 
    VARDECL: "VARDECL", 
    ASSIGNMENT: "ASSIGNMENT", 
    REASSIGNEMNT: "REASSIGNMENT", 
    FUNCDECL: "FUNCATION_DECLARATION",
    FUNCCALL: "FUNCCALL",
}


function newParser(tokens){
    let index = 0;

    function next_token_type(){
        return tokens[index].token_type;
    }

    function has_mlultiplicitive(){
        return tokens[index].token_type === TokenTypes.SYMBOL 
            && (next_token_type() === '*' || next_token_type() === '/' || next_token_type() === '%');
    }

    function has_additive(){
        return tokens[index].token_type === TokenTypes.SYMBOL 
        && (next_token_type() === '+' || next_token_type() === '-');
    }

    function has_value(c){
        return tokens[index].value === c;
    }

    function has_type(c){
        return tokens[index].token_type === c;
    }

    function match_and_discard_next_token(value){
        if (token[index].value !== value){
            //TODO: throw error at this line

        } else {
            index++;
        }
    }






    return parse_program();

    function parse_block(){
        let statements = []
        while ( index < tokens.length && tokens[index].token_type !== TokenTypes.EOF){
            statements.push(parse_statement());
        }
        return {
            type: nodeTypes.BLOCK, 
            statements: statements,
            blockID: "code"
         };
    }
    
    function parse_statement(){
        let result = null;
        let condition = null;
        let line = tokens[index].line;
        if(has_type(TokenTypes.INDENTIFIER)){
            let loc = parse_location(input);
            if (loc.type === nodeTypes.FUNCCALL){
                result = loc;
            } else {
                match_and_discard_next_token('=');
                value = parse_expression();
                result = {
                    type: nodeTypes.REASSIGNEMNT, 
                    location: loc,
                    value: value,
                }

            }
        } else if (has_type(TokenTypes.KEYWORD)){
            

        } else if (has_type(TokenTypes.COMMENT)){

        } else if (has_type(TokenTypes.LONG_COMMENT)){

        }

    }


}

