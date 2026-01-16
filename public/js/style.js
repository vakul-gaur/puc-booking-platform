const authWrapper = document.querySelector(".auth-wrapper");

document.querySelector(".register-trigger").addEventListener("click", e => {
    e.preventDefault();
    authWrapper.classList.add("toggled");
});

document.querySelector(".login-trigger").addEventListener("click", e => {
    e.preventDefault();
    authWrapper.classList.remove("toggled");
});

window.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.auth-wrapper');
    const action = wrapper.getAttribute('data-action');
    
    if (action === 'signup') {
        wrapper.classList.add('active-signup'); 
    } else {
        wrapper.classList.remove('active-signup');
    }
});