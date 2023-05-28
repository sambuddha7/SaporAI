const multiStepForm = document.querySelector("[data-multi-step]")
const formSteps = [...multiStepForm.querySelectorAll("[data-step]")]
let currentStep = formSteps.findIndex(step => {
  return step.classList.contains("active")
})
if (currentStep < 0) {
  currentStep = 0
  formSteps[currentStep].classList.add("active")
}
multiStepForm.addEventListener("click", e => {
  if (e.target.matches("[data-next]")) {
    incrementor = 1
  } else if (e.target.matches("[data-previous]")) {
    incrementor = -1
  }
  else {
    return
  }
  if (incrementor == null) return
  const inputs = [...formSteps[currentStep].querySelectorAll("input")]
  const allValid = inputs.every(input => input.reportValidity())
  if (incrementor === -1) {
    currentStep -= 1
    showCurrentStep()
  } else if (allValid) {
    currentStep += incrementor
    showCurrentStep()
  }
})
function showCurrentStep() {
  formSteps.forEach((step,index) => {
    step.classList.toggle("active", index === currentStep)
  })
}
const passwordInput = document.getElementById('password')
const confirmInput = document.getElementById('re-password')
const errorInput = document.getElementById('passwordMatchError')
confirmInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    const nextButton = document.getElementById('nextid')
    if (password !== confirmPassword) {
      passwordMatchError.style.display = 'block';
      nextButton.disabled = true
    } else {
      passwordMatchError.style.display = 'none';
      nextButton.disabled = false;
    }
  });
