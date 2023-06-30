import { textEditor } from "./milestone2";

export function generateUrl() {
    // yank the text in ace
    // console.log(textEditor.getValue());
    var code = textEditor.getValue();
    let encoded = encodeURIComponent(code);
    console.log(encoded);
    window.location += `#code=${encoded}` 
    // encode
    // encodeURIComponent is the function we use by default
    //update the url
    //future: automatically copy to clipboard

}