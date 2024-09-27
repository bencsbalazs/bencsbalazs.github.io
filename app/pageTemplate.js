document.addEventListener('DOMContentLoaded', () => {
  // Create the GitHub link and image
  let githubLink = document.createElement('a');
  githubLink.href = 'https://github.com/bencsbalazs';
  let githubImage = document.createElement('img');
  githubImage.decoding = 'async';
  githubImage.id = 'forkMeOnGithub';
  githubImage.src = '/assets/img/forkme.webp';
  githubImage.alt = 'Fork me on GitHub';
  githubImage.loading = 'lazy';
  githubImage.setAttribute('data-recalc-dims', '1');
  // Append the image to the GitHub link
  githubLink.appendChild(githubImage);
  // Get the current year
  let currentYear = new Date().getFullYear();
  // Create footer element
  let footer = document.getElementsByTagName('footer')[0];
  footer.className = 'container-fluid text-center p-2 mt-2 bg-dark text-white';
  // Create paragraph element with the copyright text
  let paragraph = document.createElement('p');
  paragraph.innerHTML = `&copy; Balázs Bencs 2009-${currentYear}`;
  // Append the paragraph to the footer
  footer.prepend(githubLink)
  footer.appendChild(paragraph);
});
