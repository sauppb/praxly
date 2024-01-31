import { stepButton } from "./common";


export function showDebug() {
    let debugOptions = document.querySelectorAll('.debugOptions');
    let debugButton = document.getElementById('debug');
    for(let button of debugOptions){
            button.style.display = 'block';
    }
    debugButton.style.display = 'none';

}

export function hideDebug() {
  let debugOptions = document.querySelectorAll('.debugOptions');
  let debugButton = document.getElementById('debug');
  for(let button of debugOptions){
          button.style.display = 'none';
  }
  debugButton.style.display = 'block';

}


const mode = 'slow';

/**
 * this is a function that Dr. Johnson made to show me how promises worked. 
 */
export function waitForStep() {
    return new Promise(resolve => {
      const listener = () => {
        stepButton.removeEventListener('click', listener);
        resolve();
      };
      stepButton.addEventListener('click', listener);
    });
  }
  
  export function waitForTimer() {
    return new Promise(resolve => {
      setTimeout(resolve, 3000);
    });
  }

