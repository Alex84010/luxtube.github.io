/* js/main.js */

/* Sidebar active link highlight based on filename */
(function(){
  const links = document.querySelectorAll('.nav a');
  const path = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href');
    if(href && href.includes(path)) a.classList.add('active');
  });
})();

/* Publish page functionality: drag & drop, file previews, upload simulation */
document.addEventListener('DOMContentLoaded', () => {
  const dragArea = document.querySelector('.drag-area');
  if(!dragArea) return; // not on publish page

  const inputFile = document.getElementById('videoInput');
  const thumbInput = document.getElementById('thumbInput');
  const videoNameEl = document.getElementById('videoName');
  const titleInput = document.getElementById('titleInput');
  const descInput = document.getElementById('descInput');
  const thumbPreview = document.getElementById('thumbPreview');
  const publishBtn = document.getElementById('publishBtn');
  const progressBar = document.querySelector('.progress-bar');
  const message = document.getElementById('formMessage');

  // drag events
  ['dragenter','dragover'].forEach(ev=> {
    dragArea.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); dragArea.style.borderColor = '#d1c2ff'; });
  });
  ['dragleave','drop'].forEach(ev=> {
    dragArea.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); dragArea.style.borderColor = '#e7e7e7'; });
  });

  dragArea.addEventListener('drop', e => {
    const files = e.dataTransfer.files;
    if(files && files.length) {
      handleVideoFile(files[0]);
    }
  });

  dragArea.addEventListener('click', () => inputFile.click());
  inputFile.addEventListener('change', (e) => {
    if(e.target.files[0]) handleVideoFile(e.target.files[0]);
  });

  thumbInput.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = ev => { thumbPreview.src = ev.target.result; thumbPreview.style.display='block'; };
    reader.readAsDataURL(f);
  });

  function handleVideoFile(file){
    if(!file) return;
    // basic validation
    if(!file.type.startsWith('video/')) {
      showMessage('Veuillez sélectionner un fichier vidéo valide.', 'error');
      return;
    }
    videoNameEl.textContent = file.name;
    videoNameEl.style.color = '#333';
    // store file in an invisible input (optional) — or keep ref
    inputFile._file = file;
    showMessage('Vidéo prête. Remplissez les champs puis cliquez sur Publier.', 'info');
  }

  function showMessage(text, type='info'){
    message.textContent = text;
    message.style.color = (type==='error') ? '#b00' : '#333';
  }

  publishBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    // simple validation
    const file = inputFile._file;
    if(!file){
      showMessage('Ajoutez d’abord une vidéo (glisser-déposer ou clic).', 'error');
      return;
    }
    if(!titleInput.value.trim()){
      showMessage('Entrez un titre pour la vidéo.', 'error');
      titleInput.focus();
      return;
    }
    // simulate upload
    publishBtn.disabled = true;
    publishBtn.textContent = 'Téléversement...';
    progressBar.style.width = '0%';
    await fakeUpload(progress => {
      progressBar.style.width = progress + '%';
    });
    publishBtn.textContent = 'Publier';
    publishBtn.disabled = false;
    showMessage('✅ Vidéo publiée avec succès !', 'info');
    // reset form lightly
    inputFile.value = '';
    inputFile._file = null;
    videoNameEl.textContent = 'Aucune vidéo sélectionnée';
    progressBar.style.width = '100%';
  });

  function fakeUpload(cb){
    return new Promise(resolve => {
      let p = 0;
      const id = setInterval(() => {
        p += Math.floor(Math.random()*12) + 8; // random accel
        if(p >= 100) { p = 100; cb(p); clearInterval(id); setTimeout(resolve, 300); }
        else cb(p);
      }, 200);
    });
  }

});

