import ace from 'ace-builds';
import { createExecutable } from './milestone1';
import { printBuffer } from './milestone1';
import { clearOutput } from './milestone1';
import { variables } from 'blockly/blocks';
import { textError } from './milestone1';


export const textEditor = ace.edit("aceCode", {fontSize: 16});
var AceRange = ace.require('ace/range').Range;


const maxLoop = 100;


// needs tested
export function highlightError(rangeArray, errorMessage) {
  // Get the session from the editor
  var session = textEditor?.getSession();

  // Convert the range array to an Ace Range object
  var range = new AceRange(rangeArray[0], rangeArray[1], rangeArray[2], rangeArray[3]);

  // Create a marker for the error range
  var marker = session.addMarker(range, "error-marker", "text");

  // Create a div element for the error message tooltip
  var tooltip = document.createElement('div');
  tooltip.className = 'error-tooltip';
  tooltip.textContent = errorMessage;

  // Calculate the line height based on the editor's font size
  var lineHeight = parseInt(textEditor?.renderer?.lineHeight, 10);

  // Create the marker element and add the tooltip
  var markerElement = document.createElement('div');
  markerElement.className = 'ace_error-marker';
  markerElement.style.top = range.start.row * lineHeight + 'px';
  markerElement.style.height = lineHeight + 'px';
  markerElement.appendChild(tooltip);

  try {
    // Find the marker layer's parent container
  var markerLayer = session.getMarkerLayer("error-marker");
  markerLayer?.element.appendChild(markerElement);

  // Add a mouse hover effect to display the error message
  markerElement.addEventListener('mouseenter', function() {
    tooltip.style.display = 'block';
  });

  markerElement.addEventListener('mouseleave', function() {
    tooltip.style.display = 'none';
  });
  }
  catch(error) {
    console.log('error adding the hover effect');
  }
}





// Get the underlying DOM element of the Ace editor

export const  indextoAceRange = (startindex, endindex) => {
  let code = textEditor?.getValue();
  var startLine = 0;
  var startLineIndex = 0;
  var endLine = 0; 
  var endLineIndex = 0;
  var currentLine = 1; 
  var currentLineIndex = 0;
  for (let i = 0; i < code.length - 1; i++) {
    if (i === startindex){
      startLine = currentLine;
      startLineIndex = currentLineIndex;
    }
    if (i === endindex){
      endLineIndex = currentLineIndex;
      endLine = currentLine;
    }
    if (code[i] === '\n'){
      currentLineIndex = 0;
      currentLine += 1;
    } else{
      currentLineIndex += 1;
    }
  }
  var start = { row: startLine, column: startLineIndex};
  var end = {row: endLine, column: endLineIndex};
  return [startLine, startLineIndex, endLine, endLineIndex];
}



export const text2tree = () => {
  let code = textEditor?.getValue();

    console.log(code);
    let lexer = new Lexer(code);
    let tokens = lexer?.lex();
    console.log(tokens);
    let parser = new Parser(tokens);
    let textjson = parser?.parse();
    console.log(textjson);
    return textjson;
}

class Token {
    constructor(type, text, startIndex, endIndex) {
      this.token_type = type;
      this.value = text;
      this.startIndex = startIndex;
      this.endIndex = endIndex;
    }
  }
  
  class Lexer {
    constructor(source) {
      if (source[source.length - 1] !== '\n'){
        source += "\n";
      } 
      this.source = source;
      this.tokens = [];
      this.i = 0;
      this.length = this.source.length;
      this.token_so_far = "";
      this.keywords = ["if", "else", "end", "print", "for", "while", 'and', 'or', 'do', 'repeat', 'until', 'not', 'return'];
      this.types = ['int', 'double', 'String', 'char', 'float', 'boolean', 'short', 'void'];
      this.startToken = 0;
      this.currentLine = 0;
    }
  
    printTokens() {
      for (let tok of this.tokens) {
        console.log(`Token: ${tok.token_type}, Value: ${tok.value}`);
      }
    }
  
    has_letter() {
      const a = this.source[this.i];
      return /^[A-Za-z]$/.test(a);
    }
  
    has(c) {
      return this.i < this.length && this.source[this.i] === c;
    }

    hasNot(c) {
      return this.i < this.length && this.source[this.i] !== c;
    }

    has_type(){
      return this.i < this.length &&  this.types.includes(this.source[this.i]);
    }

    has_ahead(c) {
      return this.i < this.length && this.source[this.i + 1] === c;
    }

    hasNot_ahead(c) {
      return this.i < this.length && !this.source[this.i + 1] !== c;
    }


    has_digit() {
        const a = this.source[this.i];
        return /^[0-9]+$/.test(a);
      }
  
    capture() {
      this.token_so_far += this.source[this.i];
      this.i++;
    }
  
    skip() {
      this.i++;
    }
  
    emit_token(type) {

      this.tokens.push(new Token(type, this.token_so_far, this.startToken, this.i));
      this.token_so_far = '';
      this.startToken = this.i;
    }
  
    lex() {
      while (this.i < this.length) {
        if (this.has("+")) {
          
          this.capture();
          if (this.has('=')){
            this.capture();
            this.emit_token('+=');
          } 
          else if (this.has( '+')){
            this.capture();
            this.emit_token('++')
          }
          
          else {
            this.emit_token("ADD");
          }
//problem
        } else if (this.has('/') && this.has_ahead('*')){
          // console.log('saw a comment');
          this.skip();
          var commentStart = this.i;
          this.skip();
          while (this.hasNot('*') && this.hasNot_ahead('/')){
            this.capture();
          }

          if (this.has('*') && this.has_ahead('/')){
            this.skip();
            this.skip();
            this.emit_token('comment');
            if (this.has('\n')){
              this.skip();
            }
          } 
          else {
            textError("lexing", 'looks like you didn\'t close your comment. Remember comments start with a \'/*\' and end with a \'*/\'.',commentStart, this.i);
          }
          
        } else if (this.has("-")) {
          this.capture();
          if (this.has('=')){
            this.capture();
            this.emit_token('-=');
          } 
          else if (this.has( '-')){
            this.capture();
            this.emit_token('--');
          }  
          else {
            this.emit_token("SUBTRACT");
          }
        } else if (this.has("%")) {
          this.capture();
          if (this.has('=')){
            this.capture();
            this.emit_token('%=');
          } else {
            this.emit_token("MOD");
          }
        } else if (this.has("*")) {
            this.capture();
            if (this.has('=')){
              this.capture();
              this.emit_token('*=');
            } else {
              this.emit_token("MULTIPLY");
            }
        } else if (this.has("^")) {
            this.capture();
            if (this.has('=')){
              this.capture();
              this.emit_token('^=');
            } else {
              this.emit_token("EXPONENT");
            }
         } else if (this.has("≠")) {
            this.capture();
            this.emit_token("Not_Equal");
        } else if (this.has("/")) {
            this.capture();
            this.emit_token("DIVIDE");
        } else if (this.has("<")) {
          this.capture();
          if (this.has("=")) {
            this.capture();
            this.emit_token("Less_Than_Equal_To");
          } else {
            this.emit_token("Less_Than");
          }
        } else if (this.has("!")) {
          this.capture();
          if (this.has("=")) {
            this.capture();
            this.emit_token("Not_Equal");
          } 
        } else if (this.has("=")) {
          this.capture();
          if (this.has('=')){
            this.capture();
            this.emit_token("Equals");
          } else {
            this.emit_token("Assignment");
          }      
        } else if (this.has(">")) {
          this.capture();
          if (this.has("=")) {
            this.capture();
            this.emit_token("Greater_Than_Equal_To");
          } else {
            this.emit_token("Greater_Than");
          }
        } else if (this.has_digit()) {
            while (this.i < this.length && this.has_digit()) {
              this.capture();
            }
            if (this.i < this.length && this.has(".")) {
              this.capture();
              while (this.i < this.length && this.has_digit()) {
                this.capture();
              }
              this.emit_token("Double");
            } else {
              this.emit_token("INT");
            }
          } else if (this.has(" ")) {
            this.skip();
          } else if (this.has("\"") || this.has("\'") ){
            this.skip();
            while (this.i < this.length && !this.has("\"") && !this.has("\'")) {
                this.capture();
              }
            if (this.has("\"") || this.has("\'") ){
              this.skip();
              this.emit_token("String");
              
            }
            else {
              textError("lexing", 'looks like you didn\'t close your quotes on your String. Remember Strings start and end with a single or double quote mark (\' or \") .',commentStart, this.i);
            }
          } else if (this.has_letter()) {
            while (this.i < this.length && (this.has_letter() || this.has_digit())) {
              this.capture();
            }
            if (this.token_so_far === "true" || this.token_so_far === "false") {
              this.emit_token("boolean");
            } else if (this.token_so_far === 'end'){
              while (this.hasNot('\n')) {
                this.capture();
              }
              this.emit_token(this.token_so_far);
            }
            else if (this.keywords.includes(this.token_so_far)) {
              this.emit_token(this.token_so_far);  
              
            } 
            else if (this.types.includes(this.token_so_far)) {
              this.emit_token('Type');  
              
            }
            // while (this.has(' ')){
            //   //skip unnessecary spaces
            //   this.skip();
            // }
            // if (this.has('(') && this.has_ahead(')')){
            //   this.skip();
            //   this.skip();
            //   this.emit_token('function');
            // }

            else if (this.has('(') || this.has_ahead('(')){
              this.emit_token('function');
            }

            // if (this.has('(')){
            //   this.skip();
            //   this.emit_token('function');
            //   while(this.hasNot(')')){
            //     this.capture();
            //   }
            //   this.skip();
            //   //TODO: lex function calls vs definitiosn with parameters
            //   this.emit_token('params');
              
            // }
             else {
              if (this.token_so_far !== ''){
                this.emit_token("Variable");

              }

            }
          } else if (this.has(",")) {
            this.capture();
            this.emit_token(",");
          
          } else if (this.has(";")) {
              this.capture();
              this.emit_token(";");
            
          } else if (this.has("(")) {
            this.capture();
            this.emit_token("(");
          } else if (this.has(")")) {
            this.capture();
            this.emit_token(")");
         } else if (this.has("\n")) {
            this.capture();
            this.emit_token("\n");
            this.currentLine += 1;
          } else if (this.has('\t')){
            // skip tabs since they only apppear to be for style
            this.skip();
          } 
          else {
            textError('lexing', `invalid character ${this.source[this.i] }`, this.i, this.i);

            console.log("invalid character at index ", this.i);
            return 0;
          }
        }
        this.emit_token("EOF");
        return this.tokens;
      }
    }

class Parser {
  constructor(tokens) {
    this.statements = [];
    this.tokens = tokens;
    this.i = 0;
    this.j = 0;
    this.length = tokens.length;
    this.eof = false;
    this.keywords = ["if", "else", "then", "done"];
    this.statementKeywords = ['if', 'print', 'for', 'while'];

  }

  hasNot(type) {
    return this.i < this.length && this.tokens[this.i].token_type !== type;
  }

  has(type) {
    return this.i < this.length && this.tokens[this.i].token_type === type;
  }

  hasAny(types){
    return this.i < this.length && types.includes(this.tokens[this.i].token_type);
  }

  hasNotAny(types){
    return this.i < this.length && !types.includes(this.tokens[this.i].token_type);
  }

  has_ahead(type) {
    return this.i + 1 < this.length && this.tokens[this.i + 1].token_type === type;
  }

  hasNot_ahead(type) {
    return this.i + 1 < this.length && this.tokens[this.i + 1].token_type != type;
  }

  has_type() {
    return this.i < this.length && this.tokens[this.i].token_type === 'Type';
  }

  has_keyword() {
    return this.keywords.includes(this.tokens[this.i].token_type);
  }
  has_statementKeyword() {
    return this.statementKeywords.includes(this.tokens[this.i].token_type);
  }

  advance() {
    this.i++;
  }




  parse() {
    if (this.tokens === 0){
      return;
    }
    return this.program();
    
    // return this.boolean_operation();
  }



  atom() {
    
    const tok = this.tokens[this.i];
    var startIndex = this.tokens[this.i].startIndex;
    var endIndex = this.tokens[this.i].endIndex;
    


    if (this.has('EOF')){
      this.eof = true;
      return;
    }

    if (this.has(',')){
      return;
    }
    else if (this.has("INT")) {

      this.advance();
      return {
        value: tok.value, 
        type: tok.token_type,
        blockID: "code",
        startIndex: startIndex, 
        endIndex: endIndex,
        beg: startIndex, 
        end: endIndex
        
      };
    } else if (this.has("String")) {
        this.advance();
        return {
          value: tok.value, 
          type: 'STRING',
          blockID: "code",
          startIndex: startIndex, 
          endIndex: endIndex,
          beg: startIndex, 
          end: endIndex
        };
    } else if (this.has("char")) {
        this.advance();
        return {
          value: tok.value, 
          type: tok.token_type,
          blockID: "code",
          startIndex: startIndex, 
          endIndex: endIndex,
          beg: startIndex, 
          end: endIndex
        };
    } else if (this.has("double")) {
        this.advance();
        return {
          value: tok.value, 
          type: tok.token_type,
          blockID: "code",
          startIndex: startIndex, 
          endIndex: endIndex,
          beg: startIndex, 
          end: endIndex
        };
    } else if (this.has("boolean")) {
      this.advance();
      return {
        value: tok.value, 
        type: 'BOOLEAN',
        blockID: "code",
        startIndex: startIndex, 
        endIndex: endIndex,
        beg: startIndex, 
        end: endIndex
      };
    
    } else if (this.has("(")) {
      this.advance();
      const expression = this.boolean_operation();
      if (this.has(")")) {
        this.advance();
      } else {
        textError('parsing', 'did not detect closing parentheses', startIndex, endIndex);
        console.log("did not detect closing parentheses");
      }
      return expression;

    }else if (this.has("Variable")){
      this.advance();
      return {
        name: tok.value, 
        type: 'VARIABLE',
        blockID: "code",
        startIndex: startIndex, 
        endIndex: endIndex,
        beg: startIndex, 
        end: endIndex 
        
      };
      

    } else {
      textError('parsing', `Missing or Unrecognized token: ${this.i} This is likely the result of a lexing error?.', startIndex, endIndex`);
      console.log(`atom problem at this token: ${this.tokens[this.i].token_type}`);
      return;
    }
  }

  exponent() {
    let l =this.unary();
    // let l =this.atom();
    while (this.has("EXPONENT")) {
      var startIndex = this.tokens[this.i].startIndex;
      var endIndex = this.tokens[this.i].endIndex;
      this.advance();
      const r =this.exponent();
      // l =new Operators.Exponent(left, right);
      l ={
              left: l, 
              right: r,
              type: "EXPONENT", 
              blockID: "code", 
              beg: l?.beg, 
              end: r?.end,
              endIndex: endIndex,
              startIndex: startIndex

          }
    }
    return l;
  }

  multiplicitive() {
    let l =this.exponent();
    while (this.has("MULTIPLY") || this.has("DIVIDE") || this.has("MOD")) {
      var endIndex = this.tokens[this.i].endIndex;
      var startIndex = this.tokens[this.i].startIndex;
      if (this.has("MULTIPLY")) {
        this.advance();
        const r =this.exponent();
        // l =new Operators.Multiplication(left, right);
        l ={
            left: l, 
            right: r,
            type: "MULTIPLY", 
            blockID: "code", 
            startIndex: startIndex, 
            endIndex: endIndex, 
            beg: l?.beg, 
            end: r?.end,
        }
      } else if (this.has("DIVIDE")) {
        this.advance();
        const r =this.exponent();
        // l =new Operators.Division(left, right);
        l ={
            left: l, 
            right: r,
            type: "DIVIDE", 
            blockID: "code", 
            startIndex: startIndex, 
            endIndex: endIndex, 
            beg: l?.beg, 
            end: r?.end,
        }
      } else if (this.has("MOD")) {
        this.advance();
        const r =this.exponent();
        // l =new Operators.Modulo(left, right);
        l ={
            left: l, 
            right: r,
            type: "MOD", 
            blockID: "code", 
            startIndex: startIndex, 
            endIndex: endIndex, 
            beg: l?.beg, 
            end: r?.end,
        }
      }
    }
    return l;
  }

  additive() {
    let l =this.multiplicitive();
    while (this.has("ADD") || this.has("SUBTRACT")) {
      var endIndex = this.tokens[this.i].endIndex;
      var startIndex = this.tokens[this.i].startIndex;
      if (this.has("SUBTRACT")) {
        this.advance();
        const r =this.multiplicitive();
        // l =new Operators.Subtraction(left, right);
        l ={
            left: l, 
            right: r,
            type: "SUBTRACT", 
            blockID: "code", 
            startIndex: startIndex, 
            endIndex: endIndex, 
            beg: l?.beg, 
            end: r?.end,
        }
      } else if (this.has("ADD")) {
        this.advance();
        const r =this.multiplicitive();
        // l =new Operators.Addition(left, right);
        l ={
            left: l, 
            right: r,
            type: "ADD", 
            blockID: "code", 
            startIndex: startIndex, 
            endIndex: endIndex, 
            beg: l?.beg, 
            end: r?.end,
        }
      }
    }
    return l;
  }

  unary(){
    if (!this.has('not') && !this.has('SUBTRACT')){
      return this.atom();
    }
    while (this.has('not')){
      var endIndex = this.tokens[this.i].endIndex;
      var startIndex = this.tokens[this.i].startIndex;
      var result = {
        blockID: 'code',
        startIndex: startIndex, 
        endIndex: endIndex
      };
      if (this.has('not')){
        this.advance();
        var expression = this.boolean_operation();
        result.type = 'NOT';
        result.value = expression;
        result.beg = l?.beg;
        result.end = r?.end;
      }
    }
    return result;
  }

  comparable() {
    let l =this.additive();
    while (
      this.has("Less_Than_Equal_To") ||
      this.has("Greater_Than_Equal_To") ||
      this.has("Less_Than") ||
      this.has("Greater_Than") ||
      this.has("Equals") ||
      this.has("Not_Equal")
      ) {
        var startIndex = this.tokens[this.i].startIndex;
        var endIndex = this.tokens[this.i].endIndex;
      if (this.has("Less_Than_Equal_To")) {
        this.advance();
        const r =this.additive();
        // l =new Operators.Less_Than_Equal_To(left, right);
        l ={
            left: l, 
            right: r,
            type: "LESS_THAN_EQUAL", 
            blockID: "code", 
            startIndex: startIndex, 
            endIndex: endIndex, 
            beg: l?.beg, 
            end: r?.end,
        }
      } else if (this.has("Greater_Than_Equal_To")) {
        this.advance();
        const r =this.additive();
        // l =new Operators.Greater_Than_EqualTo(left, right);
        l ={
            left: l, 
            right: r,
            type: "GREATER_THAN_EQUAL", 
            blockID: "code", 
            startIndex: startIndex, 
            endIndex: endIndex, 
            beg: l?.beg, 
            end: r?.end,
        }
      } else if (this.has("Less_Than")) {
        this.advance();
        const r =this.additive();
        // l =new Operators.Less_Than(left, right);
        l ={
            left: l, 
            right: r,
            type: "LESS_THAN", 
            blockID: "code", 
            startIndex: startIndex, 
            endIndex: endIndex, 
            beg: l?.beg, 
            end: r?.end,
        }
      } else if (this.has("Greater_Than")) {
        this.advance();
        const r =this.additive();
        // l =new Operators.Greater_Than(left, right);
        l ={
            left: l, 
            right: r,
            type: "GREATER_THAN", 
            blockID: "code", 
            startIndex: startIndex, 
            endIndex: endIndex, 
            beg: l?.beg, 
            end: r?.end,
        }
    } else if (this.has("Equals")) {
        this.advance();
        const r =this.additive();
        // l =new Operators.Greater_Than_EqualTo(left, right);
        l ={
            left: l, 
            right: r,
            type: "EQUALS", 
            blockID: "code", 
            startIndex: startIndex, 
            endIndex: endIndex, 
            beg: l?.beg, 
            end: r?.end,
        }
    } else if (this.has("Not_Equal")) {
        this.advance();
        const r =this.additive();
        // l =new Operators.Greater_Than_EqualTo(left, right);
        l ={
            left: l, 
            right: r,
            type: "NOT_EQUAL", 
            blockID: "code", 
            startIndex: startIndex, 
            endIndex: endIndex, 
            beg: l?.beg, 
            end: r?.end,
        }
    }
    
}
return l;
}

// not() {
//   let l =this.additive();
//   while (
//     this.has("not")
//   ) {
    
  
// }
// return l;
// }



boolean_operation() {
  let l =this.comparable();
  while (
    this.has("and") ||
    this.has("or")
    ) {
      var startIndex = this.tokens[this.i].startIndex;
      var endIndex = this.tokens[this.i].endIndex;
    if (this.has("and")) {
      this.advance();
      const r =this.additive();
      // l =new Operators.Less_Than_Equal_To(left, right);
      l ={
          left: l, 
          right: r,
          type: "AND", 
          blockID: "code", 
          startIndex: startIndex, 
          endIndex: endIndex, 
          beg: l?.beg, 
          end: r?.end,
      }
    } else if (this.has("or")) {
      this.advance();
      const r =this.additive();
      // l =new Operators.Greater_Than_EqualTo(left, right);
      l ={
          left: l, 
          right: r,
          type: "OR", 
          blockID: "code", 
          startIndex: startIndex, 
          endIndex: endIndex, 
          beg: l?.beg, 
          end: r?.end,
      }
    
  }
  
}
return l;
}


program() {
  return {
    type: "PROGRAM", 
    value: this.codeBlock('EOF'), 
    blockID: 'code'
  }

}


codeBlock(endToken) {
  let praxly_blocks = [];
   const argsArray = Array.from(arguments);
  //  while (!this.eof) {
  while (this.hasNotAny(argsArray)) {
    praxly_blocks.push(this.statement());
    this.advance();
   }
   return {
      type: "CODEBLOCK", 
      statements: praxly_blocks,
      blockID: "code"
   }

}

statement() {
  // while loop here?
  var startIndex = this.tokens[this.i].startIndex;
  var endIndex = this.tokens[this.i].endIndex;
  let result = {
    blockID: 'code', 
    startIndex: startIndex, 
    endIndex: endIndex, 
    beg: startIndex
  };
  if (this.has("if")) {

    result.type = "IF";
    this.advance();
    result.condition = this.boolean_operation();
    if (this.has('\n')){
      this.advance();
      result.statement = this.codeBlock('else', 'end if');
      if (this.has('else')) {
        this.advance();
        if (this.has('\n')){
          this.advance();
        } 
        result.type = "IF_ELSE";
        result.alternative = this.codeBlock('end if');
        
      }
      if (this.has('end if')) {
        result.end = this.tokens[this.i].endIndex;
        this.advance();
        return result;
      }
    } 
  } 
  else if (this.has('for')){
    result.type = "FOR";
    this.advance();
    if (this.hasNot('(')){
      return result;
    }
    this.advance();
    result.initialization = this.statement();
    if (this.has(';')) {
      this.advance();
      result.condition = this.boolean_operation();
      // this.advance();
      if (this.has(';')) {
        this.advance();
        result.incriment = this.statement();
        if (this.hasNot(')')){
          return result;
        }
        this.advance();
        if (this.has('\n')){
          this.advance();
          result.statement = this.codeBlock('end for');
          if (this.has('end for')){
            result.end = this.tokens[this.i].endIndex;
            this.advance();
            return result;
          }
        }
      }
      
    }
    console.log(`parser messing up, current token is ${this.tokens[this.i].token_type}`);
    return result;
   



  }
  else if (this.has('while')){
    result.type = "WHILE";
    this.advance();
    result.condition = this.boolean_operation();
    if (this.has('\n')){
      this.advance();
      result.statement = this.codeBlock( 'end while');
        
      }
      if (this.has('end while')) {
        result.end = this.tokens[this.i].endIndex;
        this.advance();
        return result;
      }
  } 
   
  else if (this.has('do')){
    result.type = "DO_WHILE";
    this.advance();
    if (this.has('\n')){
      this.advance();
      result.statement = this.codeBlock( 'while');
      
    }
    if (this.has('while')) {
      this.advance();
      if (this.hasNot('(')){
        //error
        return result;
      }
      this.advance();
      result.condition = this.boolean_operation();
      if (this.hasNot(')')){
        return result;
      }
      this.advance();
      if (this.hasNot('\n')){
        return result;
        //error
      }
      this.advance()
      result.end = this.tokens[this.i].endIndex;
        return result;
      }
  }

  else if (this.has('repeat')){
    result.type = "REPEAT_UNTIL";
    this.advance();
    if (this.has('\n')){
      this.advance();
      result.statement = this.codeBlock( 'until');
      
    }
    if (this.has('until')) {
      this.advance();
      if (this.hasNot('(')){
        //error
        return result;
      }
      this.advance();
      result.condition = this.boolean_operation();
      if (this.hasNot(')')){
        return result;
      }
      this.advance();
      if (this.hasNot('\n')){
        return result;
        //error
      }
      this.advance()
      result.end = this.tokens[this.i].endIndex;
        return result;
      }
  }

  else if (this.has("print")) {
    // while (this.has('print')) {
      this.advance();
      const expression = this.boolean_operation();
      if (this.has('\n')){
        // this.advance();
        result.type = 'PRINT';
        result.value = expression;
        result.end = expression?.end; 
        return result;
      }
  }

  else if (this.has("return")) {
    // while (this.has('print')) {
      this.advance();
      const expression = this.boolean_operation();
      if (this.has('\n')){
        // this.advance();
        result.type = 'RETURN';
        result.value = expression;
        result.end = expression.end; 
        return result;
      }

  }else if (this.has('comment')){
    result.type = 'COMMENT', 
    result.value = this.tokens[this.i].value;
    result.end = result.endIndex;
    return result;
  
  }
  else if (this.has_type() && this.has_ahead('Variable')){
      var returnType = 'Praxly_' + this.tokens[this.i].value;
      this.advance();
      if (this.has("Variable")){
        result.type = 'ASSIGNMENT';
        result.name = this.tokens[this.i].value;
        this.advance();
        if (this.has('Assignment')){
          result.startIndex = this.tokens[this.i].startIndex;
          this.advance();
          result.value = this.boolean_operation();
          result.end = result.value.end;
          result.varType = returnType;
        }
      }
      return result;
  }
  
  else if (this.has('Variable') && this.has_ahead('Assignment')){
    if (this.has("Variable")){
      result.type = 'ASSIGNMENT';
      result.name = this.tokens[this.i].value;
      this.advance();
      if (this.has('Assignment')){
        result.startIndex = this.tokens[this.i].startIndex;
        this.advance();
        result.value = this.boolean_operation();
        result.end = result.value.end;
        result.varType = 'reassignment';
      }
    }
    return result;
  }

  else if (this.has_type()&& this.has_ahead('function')){
    // console.log('saw function');
    //function code here
    result.type = 'FUNCTION_ASSIGNMENT';
    result.returnType = this.tokens[this.i].value;
    this.advance();
    if (this.hasNot('function')){
      console.error('no function name here, there is a problem');
    }
    result.name = this.tokens[this.i].value;
    this.advance();
    var args = [];
    if (this.has('(')){
      this.advance();
      var stopLoop = 0;
      while (this.hasNot(')') && stopLoop < maxLoop) {
        var param = [];
        if (this.has_type()){
          param.push(this.tokens[this.i].value);
          this.advance();
        }
        if (this.has('Variable')){
          param.push(this.tokens[this.i].value);
          this.advance();
        }
        args.push(param);
        if (this.has(',')){
          this.advance();
        }
        stopLoop+= 1;
        
      }
      console.log ('here are the params');
      console.log(args);
      if(this.has(')')){
        this.advance();
      }
      result.params = args;
      result.endindex = this.tokens[this.i].endIndex;
      if (this.has('\n')){
        this.advance();
      }
    } else {
      console.error('error, detected function but did not find parinthesees');
      return;
    }
    var contents = this.codeBlock('end ' + result.name);
    if (this.hasNot('end ' + result.name)){
      console.error('missing end function token');
      return result;
    }
    result.contents = contents;
    result.end = this.tokens[this.i].endIndex;
    this.advance();
    return result;
  }
  else if (this.has('function')){
    result.type = 'FUNCTION_CALL';
    result.name = this.tokens[this.i].value;
    this.advance();
    var args = [];
    if (this.has('(')){
      this.advance();
      var loopBreak = 0;
      while (this.hasNot(')') &&  loopBreak < maxLoop) {
        // this.advance();
        var param = this.boolean_operation();
        args.push(param);
        if (this.has(',')) {
          this.advance();
          
        }
        loopBreak++;
      }
      console.log('here are the function call params:');
      console.log(args);
      result.params = args;
      if (this.hasNot(')')){
        console.error('didnt detect closing parintheses in the arguments of  a function call');
      }
      result.endIndex = this.tokens[this.i].endIndex;
      result.end = result.endIndex;
      this.advance();
      return result;
    }
  }
  // else if (this.has('/n')){
  //   return;
  // }

  else {
    // console.log(`the current token is ${this.tokens[this.i].token_type} and the next one is ${this.tokens[this.i + 1].token_type}`)
    let contents = this.boolean_operation();
    if (contents === undefined){
      contents = null;
    }
    if (this.has('\n') || this.has(';')){
      // this.advance();
      result = {
        type: "STATEMENT", 
        value: contents, 
        blockID: "code"
      };
    }
    

  }

  return result;
  
}

  //this should be fine since there is no support for variables yet
  // assignment() {
  //   let l =this.boolean_operation();
  //   while (this.has("Assignment")) {
  //     this.advance();
  //     const r =this.boolean_operation();
  //     l =new Assignment(left, right);
  //   }
  //   return l;
  // }


}
