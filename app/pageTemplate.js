document.addEventListener('DOMContentLoaded', () => {
  // Create a style element
  let style = document.createElement('style');
  // Define the CSS rules as a string
  let css = `
  #forkMeOnGithub {
      position: absolute;
      top: 0;
      right: 0;
      width: 6em;
      height: 6em;
      z-index: 999;
  }

  header a {
      color: white;
  }
`;
  // Append the CSS rules to the style element
  style.appendChild(document.createTextNode(css));

  // Append the style element to the head of the document
  document.head.appendChild(style);

  // Header element
  header = document.getElementsByTagName('header')[0];
  header.className = 'container-fluid p-2 mb-2 bg-success text-white';

  // Create the GitHub link and image
  let githubLink = document.createElement('a');
  githubLink.href = 'https://github.com/bencsbalazs';

  let githubImage = document.createElement('img');
  githubImage.decoding = 'async';
  githubImage.id = 'forkMeOnGithub';
  githubImage.src = 'https://github.blog/wp-content/uploads/2008/12/forkme_right_orange_ff7600.png?resize=149%2C149';
  githubImage.alt = 'Fork me on GitHub';
  githubImage.loading = 'lazy';
  githubImage.setAttribute('data-recalc-dims', '1');

  // Append the image to the GitHub link
  githubLink.appendChild(githubImage);

  // Create the social media div
  let socialDiv = document.createElement('div');
  socialDiv.className = 'float-left';

  // Create the Facebook link and icon
  let facebookLink = document.createElement('a');
  facebookLink.href = 'https://www.facebook.com/balazs.bencs.9';
  facebookLink.className = 'facebook display-5 m-1';

  let facebookIcon = document.createElement('i');
  facebookIcon.className = 'bi bi-facebook';

  // Append the icon to the Facebook link
  facebookLink.appendChild(facebookIcon);

  // Create the Instagram link and icon
  let instagramLink = document.createElement('a');
  instagramLink.href = 'https://www.instagram.com/bencsbalazs/';
  instagramLink.className = 'instagram display-5 m-1';

  let instagramIcon = document.createElement('i');
  instagramIcon.className = 'bi bi-instagram';

  // Append the icon to the Instagram link
  instagramLink.appendChild(instagramIcon);

  // Create the LinkedIn link and icon
  let linkedinLink = document.createElement('a');
  linkedinLink.href = 'https://www.linkedin.com/in/bal%C3%A1zs-bencs-499917102/';
  linkedinLink.className = 'linkedin display-5 m-1';

  let linkedinIcon = document.createElement('i');
  linkedinIcon.className = 'bi bi-linkedin';

  // Append the icon to the LinkedIn link
  linkedinLink.appendChild(linkedinIcon);

  // Append all social links to the social media div
  socialDiv.appendChild(facebookLink);
  socialDiv.appendChild(instagramLink);
  socialDiv.appendChild(linkedinLink);

  // Append the GitHub link and social media div to the header
  header.appendChild(githubLink);
  header.appendChild(socialDiv);

  // Get the current year
  let currentYear = new Date().getFullYear();

  // Create footer element
  let footer = document.getElementsByTagName('footer')[0];
  footer.className = 'container-fluid text-center p-2 mt-2 bg-dark text-white';

  // Create paragraph element with the copyright text
  let paragraph = document.createElement('p');
  paragraph.innerHTML = `&copy; Balázs Bencs 2009-${currentYear}`;

  // Append the paragraph to the footer
  footer.appendChild(paragraph);
});
