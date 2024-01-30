const stepButton = document.getElementById('DebugButton');
const stopButton = document.getElementById('stopButton');
const mode = 'slow';

/**
 * this is a function that Dr. Johnson made to show me how promises worked. 
 */
function waitForStep() {
    return new Promise(resolve => {
      const listener = () => {
        stepButton.removeEventListener('click', listener);
        resolve();
      };
      stepButton.addEventListener('click', listener);
    });
  }
  
  function waitForTimer() {
    return new Promise(resolve => {
      setTimeout(resolve, 3000);
    });
  }