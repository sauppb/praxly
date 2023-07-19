import Blockly from 'blockly';
// import ace from 'ace-builds';
import {praxlyDefaultTheme } from "./theme"
import { PraxlyDark } from './theme';
import {toolbox} from './toolbox';
import { addBlockErrors, textEditor } from './lexer-parser';

import { tree2text } from './tree2text';
import {definePraxlyBlocks} from './newBlocks';
import { makeGenerator } from './generators';
import { blocks2tree } from './generators';
import { createExecutable } from './ast';
import { printBuffer } from './lexer-parser';
import { clearOutput } from './lexer-parser';
import ace from 'ace-builds';
import "ace-builds/src-min-noconflict/theme-twilight";
import "ace-builds/src-min-noconflict/theme-katzenmilch";
import { tree2blocks } from './tree2blocks';
import { errorOutput } from './lexer-parser';
import { text2tree } from './lexer-parser';
import { generateUrl, loadFromUrl } from './share';
import { colour } from 'blockly/blocks';



const output = document.querySelector('.output');
const stdError = document.querySelector('.error');
const praxlyGenerator = makeGenerator();




var mainTree = null;
const runButton = document.getElementById('runButton');
const darkModeButton = document.getElementById('darkMode');
const blockUpdatesButton = document.getElementById('blockUpdates');
let darkMode = false;
let live = true;

runButton.addEventListener('mouseup', () => { 
  clearOutput();
  // mainTree = blocks2tree(workspace, praxlyGenerator);
  if (mainTree === null){
    alert('there is nothing to run :( \n try typing some code or dragging some blocks first.');
  }
  console.log(mainTree);
  const executable = createExecutable(mainTree);
  console.log(executable);
  executable.evaluate();
  output.innerHTML = printBuffer;
  stdError.innerHTML = errorOutput;
  //might have to remove
  addBlockErrors(workspace);
  

});

// this function gets called every time a charater is typed in the editor.
export const turnCodeToBLocks = () => {
  
  // console.log("ace has the lock");
  workspace.removeChangeListener(turnBlocksToCode); 
  clearOutput();
  mainTree = text2tree();
  workspace.clear();
  tree2blocks(workspace, mainTree);
  workspace.render();
  stdError.innerHTML = errorOutput;

}

// this function gets called whenever the blocks are modified. 
let turnBlocksToCode = () => {

  // console.log("blockly has the lock");
  textEditor.removeEventListener("input", turnCodeToBLocks);
  // clearOutput();

  mainTree = blocks2tree(workspace, praxlyGenerator);
  console.log(mainTree);
  const text = tree2text(mainTree, 0, 0);

  textEditor.setValue(text, -1);
  stdError.innerHTML = errorOutput;
  
};

// runCode.addEventListener('click', turnCodeToBLocks);




export const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolbox,
  scrollbars: false,
  horizontalLayout: false,
  toolboxPosition: "start",
  theme: praxlyDefaultTheme,
  renderer: 'zelos'
});


definePraxlyBlocks(workspace);


const resizeBar = document.querySelector('.resizeBar');
const leftPane = document.querySelector('#blocklyDiv');
const rightPane = document.querySelector('#aceCode');

let isResizing = false;

resizeBar.addEventListener('mousedown', function(e) {
  isResizing = true;

  document.addEventListener('mousemove', resizeHandler);
});

document.addEventListener('mouseup', function(e) {
  isResizing = false;

  document.removeEventListener('mousemove', resizeHandler);

  Blockly.svgResize(workspace);
  textEditor.resize();
});

function resizeHandler(e) {
  if (!isResizing) return;

  const containerWidth = document.querySelector('main').offsetWidth;
  const mouseX = e.pageX;
  const leftPaneWidth = (mouseX / containerWidth) * 100;
  const rightPaneWidth = 100 - leftPaneWidth;

  leftPane.style.flex = leftPaneWidth;
  rightPane.style.flex = rightPaneWidth;
}
var toolboxstylesheet = document.getElementById("ToolboxCss");

function setDark(){
  workspace.setTheme(PraxlyDark);
  textEditor.setTheme("ace/theme/twilight");
  var bodyElement = document.body;
  bodyElement.style.backgroundColor = "black";
  var elements = document.querySelectorAll(".output, .error, .nav-bar");
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = "#303030";
    elements[i].style.color = "white";
  }
  toolboxstylesheet.href = "darkThemeToolbox.css";
}

function setLight(){
  workspace.setTheme(praxlyDefaultTheme);
  textEditor.setTheme('ace/theme/katzenmilch');
  var bodyElement = document.body;
  bodyElement.style.backgroundColor = "white";
  var elements = document.querySelectorAll(".output, .error, .nav-bar");
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = "#e3e6e4";
    elements[i].style.color = "black";
  }
  toolboxstylesheet.href = "toolbox.css";
}


darkModeButton.addEventListener('click', ()=> {

  if (!darkMode) {
    darkMode = true;
    setDark();
    
  } else {
    setLight();
    darkMode = false;

  }
}
);

blockUpdatesButton.innerText = 'block updates: live ';
workspace.addChangeListener( turnBlocksToCode); 
textEditor.addEventListener("input", turnCodeToBLocks);


blockUpdatesButton.addEventListener('click', () => {
  
  if (!live){
    runButton.removeEventListener('mousedown', turnCodeToBLocks);
    blockUpdatesButton.innerText = 'block updates: live ';
    workspace.addChangeListener( turnBlocksToCode);
    textEditor.addEventListener("input", turnCodeToBLocks);
    live = true;
  } else {
    blockUpdatesButton.innerText = 'block updates: on run (not implimented yet)';
    workspace.removeChangeListener(turnBlocksToCode);
    textEditor.removeEventListener("input", turnCodeToBLocks);
    runButton.addEventListener('mousedown', turnCodeToBLocks);
    live = false;
  }
});

//solution: clicking will force disable/enable
leftPane.addEventListener('click', () => {
  workspace.removeChangeListener(turnBlocksToCode); 
  workspace.addChangeListener( turnBlocksToCode);
});

rightPane.addEventListener('click', () => {
  textEditor.removeEventListener("input", turnCodeToBLocks);
  textEditor.addEventListener("input", turnCodeToBLocks);
});

const editorElement = textEditor.container;

// Attach a keydown event listener to the editor's DOM element
editorElement.addEventListener("keydown", function(event) {
  // Check if the event key is 's' and Ctrl or Command key is pressed
  if ((event.key === 's' || event.key === 'S') && (event.ctrlKey || event.metaKey)) {
    // Prevent the default save action (e.g., opening the save dialog)
    event.preventDefault();
    const output = document.querySelector('.output');
    // const error = document.querySelector('.error');
    output.innerHTML = "";
    // clearOutput();
    
    // Log the current text typed in the editor to the console
    // let code = textEditor.getValue();

    
    
    // console.log(code);
    // let lexer = new Lexer(code);
    // let tokens = lexer.lex();
    // console.log(tokens);
    // let parser = new Parser(tokens);
    // let textjson = parser.parse();
    // console.log(textjson);
    const trees = createExecutable(mainTree);
    trees.evaluate();

      
    output.innerHTML = printBuffer;
    stdError.innerHTML = errorOutput;
    // console.log('error message below');
    // console.log(errorOutput);
    console.log(trees);
    
    
  }
});

//share button 
const shareButton = document.getElementById('share');
shareButton.addEventListener('click', generateUrl);

loadFromUrl(turnCodeToBLocks);