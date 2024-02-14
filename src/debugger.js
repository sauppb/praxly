import { DebugButton, stepButton, stepIntoButton, stopButton } from "./common";


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
  let debug = document.getElementById('debug');
  for(let button of debugOptions){
          button.style.display = 'none';
  }
  debug.style.display = 'block';

}




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
  

/**
 * this is a future idea for a slowed down version of running the code. 
 * @returns 
 */
  export function waitForTimer() {
    return new Promise(resolve => {
      setTimeout(resolve, 3000);
    });
  }



/**
 * This function will present a coming soon toast. 
 * This works as a great eventListener for buttons that are not yet implemented.
 */
function comingSoon() {
  const ComingSoonToast = document.getElementById('comingSoon');

  ComingSoonToast.style.display = 'block';
  setTimeout(function () {
    ComingSoonToast.style.display = 'none';
  }, 3000); // Hide the toast after 3 seconds (adjust as needed)
}


