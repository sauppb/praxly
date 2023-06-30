import Blockly from 'blockly';
// import ace from 'ace-builds';
import {praxlyDefaultTheme } from "./theme"
import { PraxlyDark } from './theme';
import {toolbox} from './toolbox';
import { textEditor } from './milestone2';

import { tree2text } from './tree2text';
import {definePraxlyBlocks} from './newBlocks';
import { makeGenerator } from './generators';
import { blocks2tree } from './generators';
import { createExecutable } from './milestone1';
import { printBuffer } from './milestone1';
import { clearOutput } from './milestone1';
import ace from 'ace-builds';
import "ace-builds/src-min-noconflict/theme-twilight";
import "ace-builds/src-min-noconflict/theme-katzenmilch";
import { tree2blocks } from './tree2blocks';
import { errorOutput } from './milestone1';
import { text2tree } from './milestone2';
import { generateUrl, loadFromUrl } from './share';



const output = document.querySelector('.output');
const praxlyGenerator = makeGenerator();




var mainTree = null;
const runButton = document.getElementById('runButton');
const runCode = document.getElementById('runCode');
const darkModeButton = document.getElementById('darkMode');
const blockUpdatesButton = document.getElementById('blockUpdates');
let darkMode = false;
let live = true;

runButton.addEventListener('click', () => { 
  // clearOutput();
  // mainTree = blocks2tree(workspace, praxlyGenerator);
  if (mainTree === null){
    alert('there is nothing to run :( \n try typing some code or dragging some blocks first.');
  }
  console.log(mainTree);
  const executable = createExecutable(mainTree);
  console.log(executable);
  executable.evaluate();
  output.innerHTML = printBuffer;
  

});


export const turnCodeToBLocks = () => {
  // I had to wrap this function in a mutex to prevent an infinite loop lol
  console.log("ace has the lock");
  workspace.removeChangeListener(turnBlocksToCode); 
  clearOutput();
  mainTree = text2tree();
  workspace.clear();
  tree2blocks(workspace, mainTree);
  workspace.render();

}

let turnBlocksToCode = () => {
  // same here with the mutex

  console.log("blockly has the lock");
  textEditor.removeEventListener("input", turnCodeToBLocks);
  clearOutput();

  mainTree = blocks2tree(workspace, praxlyGenerator);
  console.log(mainTree);
  const text = tree2text(mainTree, 0, 0);

  textEditor.setValue(text, -1);
  
  
};

runCode.addEventListener('click', turnCodeToBLocks);


definePraxlyBlocks();


export const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolbox,
  scrollbars: false,
  horizontalLayout: false,
  toolboxPosition: "start",
  theme: praxlyDefaultTheme,
  renderer: 'zelos'
});





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


darkModeButton.addEventListener('click', ()=> {
  var stylesheet = document.getElementById("ToolboxCss");

  if (!darkMode) {
    workspace.setTheme(PraxlyDark);
    stylesheet.setAttribute("href", 'public/darkThemeToolbox.css');
    textEditor.setTheme("ace/theme/twilight");
    darkMode = true;
    // textEditor.setTheme("ace/theme/dracula");
    
  } else {
    workspace.setTheme(praxlyDefaultTheme);
    darkMode = false;
    stylesheet.setAttribute("href", '/toolbox.css');
    textEditor.setTheme('ace/theme/katzenmilch');
  }
}
);

blockUpdatesButton.innerText = 'block updates: live ';
workspace.addChangeListener( turnBlocksToCode);
textEditor.addEventListener("input", turnCodeToBLocks);


blockUpdatesButton.addEventListener('click', () => {
  
  if (!live){
    blockUpdatesButton.innerText = 'block updates: live ';
    workspace.addChangeListener( turnBlocksToCode);
    textEditor.addEventListener("input", turnCodeToBLocks);
    live = true;
  } else {
    workspace.removeChangeListener(turnBlocksToCode);
    blockUpdatesButton.innerText = 'block updates: on save (not implimented yet)';
    textEditor.removeEventListener("input", turnCodeToBLocks);
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
    const error = document.querySelector('.error');
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
    error.innerHTML = errorOutput;
    // console.log('error message below');
    // console.log(errorOutput);
    console.log(trees);
    
    
  }
});

//share button 
const shareButton = document.getElementById('share');
shareButton.addEventListener('click', generateUrl);

loadFromUrl(turnCodeToBLocks);