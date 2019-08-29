(async function() {
  const expensesLink = document.getElementById('expenses-link');
  const profilePicture = document.getElementById('profile-picture');
  const userFullname = document.getElementById('user-fullname');
  const logInButton = document.getElementById('log-in');
  const logOutButton = document.getElementById('log-out');

  logInButton.onclick = async () => {
    await login();
  };

  if (isAuthenticated()) {
    const user = await getUser();
    profilePicture.src = user.picture;
    userFullname.innerText = user.name;

    logOutButton.style.display = 'inline-block';
    expensesLink.style.display = 'inline-block';
  } else {
    logInButton.style.display = 'inline-block';
  }
})();
