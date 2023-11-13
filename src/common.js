// this is going to be the place wahere all shared enums and constants.

/**
 * this is the 'enum' that I use when I refer to types.
 */
export const TYPES = {
    INT: "INT",
    DOUBLE: "DOUBLE",
    STRING: "STRING",
    BOOLEAN: "BOOLEAN",
    FLOAT: "FLOAT",
    SHORT: "SHORT",
    CHAR: "CHAR",
    VOID: "VOID",
    INVALID: "INVALID"
  };


  /**
   * this is the 'enum' that I refer to when dealing with operations. 
   */
  export const OP = {
    ASSIGNMENT: "ASSIGNMENT",
    ADDITION: "ADDITION",
    SUBTRACTION: "SUBTRACTION",
    MULTIPLICATION: "MULTIPLICATION",
    DIVISION: "DIVISION",
    MODULUS: "MODULUS",
    EXPONENTIATION: "EXPONENTIATION",
    ASSIGNMENT: "ASSIGNMENT",
    EQUALITY: "EQUALITY",
    INEQUALITY: "INEQUALITY",
    GREATER_THAN: "GREATER THAN",
    LESS_THAN: "LESS THAN",
    GREATER_THAN_OR_EQUAL: "GREATER THAN OR EQUAL",
    LESS_THAN_OR_EQUAL: "LESS THAN OR EQUAL",
    AND: "AND",
    OR: "OR",
    NOT: "NOT",
    NEGATE: "NEGATE",
};




/**
 * the below functions are not yet migrated yet.
 */





export const NODETYPES = {
    ...OP, 
    ...TYPES, 
    PRINT:      "print", 
    PRINTLN:    "println", 
    CODEBLOCK:  "codeblock", 
    PRORAM:     "program", 
    STATEMENT:  "statement", 
    IF:         "if", 
    IF_ELSE:    "if_else", 
    VARDECL:    "vardecl", 
    ARRAY_ASSIGNMENT: "array_assignment", 
    LOCATION: "location", 
    FOR: "for", 
    WHILE: "while", 
    DO_WHILE: "do_while", 
    REPEAT_UNTIL: "repeat until", 
    COMMENT: "comment", 
    SINGLE_LINE_COMMENT: "single line comment", 
    FUNCDECL: "funcdecl", 
    FUNCCALL: "function call", 
    RETURN: "return", 
    ARRAY_LITERAL: "array literal", 
    ARRAY_REFERENCE: "array reference", 
    ARRAY_REFERENCE_ASSIGNMENT: "ARRAY_REFERENCE_ASSIGNMENT", // remove?
}

export class PraxlyErrorException extends Error {
  constructor(message, line) {
    super(`<pre>error occured on line ${line}:\n\t${message}</pre>`);
    this.errorMessage = this.message;
    appendAnnotation(message, line);
    errorOutput += this.message;

  }
}

export const MAX_LOOP = 100;  //this is the universal limit to loops and soon to be a recursion level limit to prevent infinite loops
export var printBuffer = "";
export var errorOutput = "";
export var blockErrorsBuffer = {};
export var annotationsBuffer = [];
export var markersBuffer = [];



// gotten to here



export function addToPrintBuffer (message){
  printBuffer += message;
}

