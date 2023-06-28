
// import { workspace } from "./main";

import { indextoAceRange } from "./milestone2";

  

export var printBuffer = "";
var variableList = {};
export var errorOutput = "";
export var blockErrors = {};



export function textError(type, error, startIndex, endIndex){
    var ranges = indextoAceRange(startIndex, endIndex);
    errorOutput += `${type} error occured on line line ${ranges[0]}:    ${error}\n`;
}



export function addBlockErrors(blockid, message, workspace){
    var block = workspace.getBlockById(blockid);
    block.setWarningText(message);

}

export function runtimeError(errormessage, blockjson){
    if (typeof(blockjson.startIndex !== 'undefined') && typeof(blockjson.endIndex !== 'undefined')){
        textError('runtime', errormessage, blockjson.startIndex, blockjson.endIndex);
    }
    if (typeof(blockjson.blockid !== 'undefined')){
        blockErrors[blockjson.blockid] = errormessage;
    }


}

export function clearOutput() {
    printBuffer = "";
    errorOutput = "";
    blockErrors = {};
}


export const createExecutable = (blockjson) => {
    if (typeof blockjson === 'undefined' || typeof blockjson.type === 'undefined'  ) {
        console.error('error constructing the tree: reached an invalid branch that is either undefined or has an undefined type');
        return new Praxly_invalid();
      }
      


    console.log(blockjson.type);
    switch(blockjson.type) {
        case 'INT':
            return new Praxly_int(blockjson.value);
        case 'STRING':
            return new Praxly_String(blockjson.value);
        case 'BOOLEAN':
            return new Praxly_boolean(blockjson.value);
        
        // more here coming soon
        case 'ADD':
            return new Praxly_addition(createExecutable(blockjson.left), createExecutable(blockjson.right));
        
        case 'SUBTRACT':
            return new Praxly_subtraction(createExecutable(blockjson.left), createExecutable(blockjson.right));
        case 'MULTIPLY':
            return new Praxly_multiplication(createExecutable(blockjson.left), createExecutable(blockjson.right));
        case 'DIVIDE':
            return new Praxly_division(createExecutable(blockjson.left), createExecutable(blockjson.right));
        case 'EXPONENT':
            return new Praxly_exponent(createExecutable(blockjson.left), createExecutable(blockjson.right));
        case 'MOD':
            return new Praxly_modulo(createExecutable(blockjson.left), createExecutable(blockjson.right));
        case 'AND':
            return new Praxly_and(createExecutable(blockjson.left), createExecutable(blockjson.right));
        case 'OR':
            return new Praxly_or(createExecutable(blockjson.left), createExecutable(blockjson.right));
        case 'EQUALS':
            return new Praxly_equals(createExecutable(blockjson.left), createExecutable(blockjson.right));
        case 'LESS_THAN_EQUAL':
            return new Praxly_less_than_equal(createExecutable(blockjson.left), createExecutable(blockjson.right));
        case 'GREATER_THAN_EQUAL':
            return new Praxly_greater_than_equal(createExecutable(blockjson.left), createExecutable(blockjson.right));
        case 'GREATER_THAN':
            return new Praxly_greater_than(createExecutable(blockjson.left), createExecutable(blockjson.right));
        case 'LESS_THAN':
            return new Praxly_less_than(createExecutable(blockjson.left), createExecutable(blockjson.right));
        case 'NOT_EQUAL':
            return new Praxly_not_equals(createExecutable(blockjson.left), createExecutable(blockjson.right));
        
        
        case 'PRINT':
            return new Praxly_print(createExecutable(blockjson.value));

        case 'CODEBLOCK':
            let statements = blockjson.statements;
            
            let result = statements.map((statement) => {
                try {
                    return createExecutable(statement);
                } catch (error)  {
                    console.error('An error occurred: empty statement', error);
                    return null;
                }
                
            });
            return new Praxly_codeBlock(result);

        case 'PROGRAM':
            variableList = {};
            return new Praxly_program(createExecutable( blockjson.value));
            
        case 'STATEMENT':
            try {
                return new Praxly_statement( createExecutable(blockjson.value));
            } catch (error)  {
                console.error('An error occurred: empty statement', error);
                return  new Praxly_statement(null);
            }

        case 'IF':
            try{
                return new Praxly_if(createExecutable(blockjson.condition), createExecutable(blockjson.statement));
            }
            catch (error) {
                console.error('An error occurred: empty statement', error);
                return  new Praxly_statement(null);
            }
        case 'IF_ELSE':
            try{
                return new Praxly_if_else(createExecutable(blockjson.condition), createExecutable(blockjson.statement), createExecutable(blockjson.alternative));
            }
            catch (error) {
                console.error('An error occurred: empty statement', error);
                return  new Praxly_statement(null);
            }
        case 'ASSIGNMENT':
            try {
                return new Praxly_assignment(blockjson.varType, blockjson.name, createExecutable(blockjson.value));
            } 
            catch (error) {
                console.error('assignment error: ', error);
                return null;
            }
        
        case 'VARIABLE':
            try {
                return new Praxly_variable(blockjson.name);
            } 
            catch (error) {
                console.error('assignment error: ', error);
                return null;
            }
        case 'FOR':
            try{
                var initialization = createExecutable(blockjson.initialization);
                var condition = createExecutable(blockjson.condition);
                var incrimentation = createExecutable(blockjson.incriment);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_for(initialization, condition, incrimentation, statement);
            }
            catch (error) {
                console.error('An error occurred: empty statement', error);
                return  new Praxly_statement(null);
            }
        case 'WHILE':
            try{
                var condition = createExecutable(blockjson.condition);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_while(condition, statement);
            }
            catch (error) {
                console.error('An error occurred: empty statement', error);
                return  new Praxly_statement(null);
            }
        case 'DO_WHILE':
            try{
                var condition = createExecutable(blockjson.condition);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_do_while(condition, statement);
            }
            catch (error) {
                console.error('An error occurred: empty statement', error);
                return  new Praxly_statement(null);
            }
        case 'REPEAT_UNTIL':
            try{
                var condition = createExecutable(blockjson.condition);
                var statement = createExecutable(blockjson.statement);
                return new Praxly_repeat_until(condition, statement);
            }
            catch (error) {
                console.error('An error occurred: empty statement', error);
                return  new Praxly_statement(null);
            }
        case 'NOT':
            return new Praxly_not(createExecutable(blockjson.value));
        case 'COMMENT':
            return  new Praxly_comment(blockjson.value);


            

    }
}


class Praxly_comment {
    constructor(value ) {
        this.value = value;
    }
    evaluate() {
        return;
    }

}

class Praxly_int {
    constructor(value ) {
        this.value = Math.floor(value);
    }
    evaluate() {
        return this;
    }

}

class Praxly_double {
    constructor(value ) {
        this.value = value;

    }

}

class Praxly_float {
    constructor(value ) {
        this.value = Math.floor(value);

    }

}

class Praxly_boolean {
    constructor(value  ) {
        this.value = value;

    }
    evaluate() {
        return this;
    }

}

class Praxly_char {
    constructor(value  ) {
        this.value = value;

    }

}

class Praxly_String {
    constructor(value  ) {
        this.value = value;
    }
    evaluate() {
        return this;
    }
}

class Praxly_print {
      
    constructor(value  ){
        this.expression = value;
    }
    evaluate() {
        
        printBuffer += (this.expression.evaluate().value.toString()) + '<br>';
        return null;
    }
}

class Praxly_addition {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate()   {
        let b = this.b_operand.evaluate();
        let a = this.a_operand.evaluate();
        switch (typecheck("ADD", a, b)) {
            case "INT":
                return new Praxly_int( a.value + b.value); 
            case "STRING":
                return new Praxly_String( a.value + b.value);
            case "DOUBLE":
                return new Praxly_double( a.value + b.value);
            case "BOOLEAN":
                return new Praxly_boolean( a.value + b.value);
        }   
    }
}

class Praxly_subtraction {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }
    
    evaluate()   {
        let b = this.b_operand.evaluate();
        let a = this.a_operand.evaluate();
        switch (typecheck("SUBTRACT", a, b)) {
            case "INT":
                return new Praxly_int( a.value - b.value); 
            case "STRING":
                return new Praxly_String( a.value - b.value);
            case "DOUBLE":
                return new Praxly_double( a.value - b.value);
            case "BOOLEAN":
                return new Praxly_boolean( a.value - b.value);
        }   
    }
}

class Praxly_multiplication {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }
    
    evaluate()   {
        let b = this.b_operand.evaluate();
        let a = this.a_operand.evaluate();
        switch (typecheck("MULTIPLY", a, b)) {
            case "INT":
                return new Praxly_int( a.value * b.value); 
            case "STRING":
                return new Praxly_String( a.value * b.value);
            case "DOUBLE":
                return new Praxly_double( a.value * b.value);
            case "BOOLEAN":
                return new Praxly_boolean( a.value * b.value);
        }   
    }
}

class Praxly_division {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }
    
    evaluate()   {
        let b = this.b_operand.evaluate();
        let a = this.a_operand.evaluate();
        switch (typecheck("DIVISION", a, b)) {
            case "INT":
                return new Praxly_int( a.value / b.value); 
            case "STRING":
                return new Praxly_String( a.value / b.value);
            case "DOUBLE":
                return new Praxly_double( a.value / b.value);
            case "BOOLEAN":
                return new Praxly_boolean( a.value / b.value);
        }   
    }
}

class Praxly_modulo {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }
    
    evaluate()   {
        let b = this.b_operand.evaluate();
        let a = this.a_operand.evaluate();
        switch (typecheck("MODULO", a, b)) {
            case "INT":
                return new Praxly_int( a.value % b.value); 
            case "STRING":
                return new Praxly_String( a.value % b.value);
            case "DOUBLE":
                return new Praxly_double( a.value % b.value);
            case "BOOLEAN":
                return new Praxly_boolean( a.value % b.value);
        }   
    }
}

class Praxly_exponent {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }
    
    evaluate()   {
        let b = this.b_operand.evaluate();
        let a = this.a_operand.evaluate();
        switch (typecheck("EXPONENT", a, b)) {
            case "INT":
                return new Praxly_int( a.value ** b.value); 
            case "STRING":
                return new Praxly_String( a.value ** b.value);
            case "DOUBLE":
                return new Praxly_double( a.value ** b.value);
            case "BOOLEAN":
                return new Praxly_boolean( a.value ** b.value);
        }   
    }
}

class Praxly_and {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate()   {
        
        return new Praxly_boolean( this.a_operand.evaluate().value && this.b_operand.evaluate().value);
    }      
}

class Praxly_or {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate()   {
        return new Praxly_boolean( this.a_operand.evaluate().value || this.b_operand.evaluate().value);
    }      
}

class Praxly_equals {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate()   {
        return new Praxly_boolean( this.a_operand.evaluate().value === this.b_operand.evaluate().value);
    }      
}

class Praxly_not_equals {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate()   {
        return new Praxly_boolean( this.a_operand.evaluate().value != this.b_operand.evaluate().value);
    }      
}

class Praxly_greater_than {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate()   {
        return new Praxly_boolean( this.a_operand.evaluate().value > this.b_operand.evaluate().value);
    }      
}

class Praxly_less_than {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate()   {
        return new Praxly_boolean( this.a_operand.evaluate().value < this.b_operand.evaluate().value);
    }      
}

class Praxly_greater_than_equal {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate()   {
        return new Praxly_boolean( this.a_operand.evaluate().value >= this.b_operand.evaluate().value);
    }      
}

class Praxly_less_than_equal {
    a_operand  ;
    b_operand  ;

    constructor(a  , b  ) {
        this.a_operand = a;
        this.b_operand = b;
    }

    evaluate()   {
        return new Praxly_boolean( this.a_operand.evaluate().value <= this.b_operand.evaluate().value);
    }      
}

class Praxly_if {
    constructor(condition, code) {
        this.condition = condition;
        this.code = code;
    }
    evaluate() {
        if(this.condition.evaluate().value) {
            this.code.evaluate();
        }
        return 'success';
    }
}

class Praxly_if_else {
    constructor(condition, code, alternitive) {
        this.condition = condition;
        this.code = code;
        this.alternitive = alternitive;
    }
    evaluate() {
        if(this.condition.evaluate().value) {
            this.code.evaluate();
        } else {
            this.alternitive.evaluate();
        }
        return 'success';
    }
}



// this might be useless but it it meant to package statements 
class Praxly_statement {
    constructor(contents){
        this.contents = contents;
    }
    evaluate(){
        try{
            return this.contents.evaluate();
        } catch (error)  {
            // addError('error from index ');
            console.error('An error occurred: empty statement', error);
            return; 
        }
        
        
    }
}



// this is a wrapper for the whole program
class Praxly_program {
    constructor(codeblockk) {
        this.codeBlock = codeblockk;
    }
    evaluate() {
        return this.codeBlock.evaluate();
    }
}

class Praxly_codeBlock {
    constructor(praxly_blocks) {
        this.praxly_blocks = praxly_blocks;
        console.log(this.praxly_blocks);
    }
    evaluate() {
        this.praxly_blocks.forEach(element => {
            try{
                element.evaluate();
            } catch (error)  {
                console.error('An error occurred: empty statement', error); 
            }
            
        });
        return "Exit_Success";
    }
}



class Praxly_assignment {
    constructor(type, name, expression){
        if (type === "reassignment"){
            console.log(variableList);
            if (!variableList.hasOwnProperty(name)){
                console.error(`Error: variable name ${name} not in the variablelist: \n ${variableList}`);
            }
  
            if (variableList[name].evaluate().constructor.name !== expression.evaluate().constructor.name){
                console.error("Error: varible reassignment does not match declared type:");
            }
            
          
        } else {
            if (expression.evaluate().constructor.name !== type){
                console.error(`Error: varible assignment does not match declared type:\n expression type: ${expression.evaluate().constructor.name} \n type: ${type}`);
            }
            variableList[name] = expression;
                  
        }
        this.type = type;
        this.name = name;
        this.value = expression;
        
    }
    evaluate() {
        variableList[this.name] = this.value.evaluate();
    }
}

class Praxly_variable {
    constructor(name){
        if (!variableList.hasOwnProperty(name)){
            console.error("Error: variable name not in the variablelist:");
        }
        this.name = name;
    }
    evaluate(){
        return variableList[this.name];
    }
}

class Praxly_for {
    constructor(initialization, condition, incrimentation, statement){
        this.initialization = initialization;
        this.condition = condition; 
        this.incrimentation = incrimentation;
        this.statement = statement;
    }
    evaluate() {
        this.initialization.evaluate();
        var loopLimit = 0;
        while (loopLimit < 500 && this.condition.evaluate().value) {
            this.statement.evaluate();
            this.incrimentation.evaluate();

        }
    }
}

class Praxly_while {
    constructor(condition, statement){
        this.condition = condition; 
        this.statement = statement;
    }
    evaluate() {
        var loopLimit = 0;
        while (loopLimit < 500 && this.condition.evaluate().value) {
            this.statement.evaluate();
        }
    }
}
class Praxly_do_while {
    constructor(condition, statement){
        this.condition = condition; 
        this.statement = statement;
    }
    evaluate() {
        this.statement.evaluate();
        var loopLimit = 0;
        while (loopLimit < 500 && this.condition.evaluate().value) {
            this.statement.evaluate();
        }
    }
}
class Praxly_repeat_until {
    constructor(condition, statement){
        this.condition = condition; 
        this.statement = statement;
    }
    evaluate() {
        var loopLimit = 0;
        this.statement.evaluate();
        while (loopLimit < 500 && ! this.condition.evaluate().value) {
            this.statement.evaluate();
        }
    }
}

class Praxly_not {
    constructor(value  ){
        this.expression = value;
    }

    evaluate() {
        return new Praxly_boolean(!this.expression.evaluate().value);
    }
}

class Praxly_invalid {
    constructor() {
        this.error = 'error\n';
    }
    evaluate() {
        printBuffer += this.error;
    }
}

//alright, here's the fun function


const ResultType = {
    INT: "INT",
    DOUBLE: "DOUBLE",
    STRING: "STRING",
    BOOLEAN: "BOOLEAN",
    INVALID: "INVALID"
  };
  
  function typecheck(operation, op1, op2) {
    switch (operation) {
      case "ADD":
        return checkAddition(op1, op2);
      case "SUBTRACT":
      case "MULTIPLY":
      case "DIVIDE":
      case "EXPONENT":
      case "MODULO":
        return checkBinaryOperation(op1, op2);
      case "GREATER_THAN":
      case "EQUAL":
      case "LESS_THAN":
      case "GREATER_THAN_EQUAL":
      case "LESSTHAN_EQUAL":
      case "NOT_EQUAL":
        return checkComparisonOperation(op1, op2);
      default:
        console.log("typecheck issue");
        return null;
    }
  }
  
  function checkAddition(op1, op2) {
    if (
      (op1 instanceof Praxly_int && op2 instanceof Praxly_int) ||
      (op1 instanceof Praxly_double && op2 instanceof Praxly_double)
    ) {
      return ResultType.INT;
    } else if (
      op1 instanceof Praxly_int ||
      op2 instanceof Praxly_int ||
      op1 instanceof Praxly_double ||
      op2 instanceof Praxly_double ||
      op1 instanceof Praxly_String ||
      op2 instanceof Praxly_String
    ) {
      return ResultType.STRING;
    } else {
      return ResultType.INVALID;
    }
  }
  
  function checkComparisonOperation(op1, op2) {
    if (
      (op1 instanceof Praxly_int && op2 instanceof Praxly_int) ||
      (op1 instanceof Praxly_double && op2 instanceof Praxly_double) ||
      (op1 instanceof Praxly_String && op2 instanceof Praxly_String) ||
      (op1 instanceof Praxly_boolean && op2 instanceof Praxly_boolean) ||
      (op1 instanceof Praxly_char && op2 instanceof Praxly_char)
    ) {
      return ResultType.BOOLEAN;
    } else {
      return ResultType.INVALID;
    }
  }
  
  function checkBinaryOperation(op1, op2) {
    if (
      (op1 instanceof Praxly_int && op2 instanceof Praxly_int) ||
      (op1 instanceof Praxly_double && op2 instanceof Praxly_double)
    ) {
      return ResultType.INT;
    } else {
        console.log('we have an issue');
        return ResultType.INVALID;
    }
  }
  


