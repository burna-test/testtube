// Simple script to help download sound files for the flight simulator
document.addEventListener('DOMContentLoaded', function() {
    const container = document.createElement('div');
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';
    container.style.padding = '20px';
    
    const header = document.createElement('h1');
    header.textContent = 'Sound File Downloader for 3D Paper Plane Flight Simulator';
    container.appendChild(header);
    
    const intro = document.createElement('p');
    intro.textContent = 'This page helps you download and prepare sound files for the flight simulator. Follow these steps:';
    container.appendChild(intro);
    
    const instructions = document.createElement('ol');
    
    const step1 = document.createElement('li');
    step1.innerHTML = '<strong>Download sound files</strong> from one of these sources:';
    
    const sources = document.createElement('ul');
    const sites = [
        { name: 'Freesound.org', url: 'https://freesound.org/' },
        { name: 'Pixabay Sound Effects', url: 'https://pixabay.com/sound-effects/' },
        { name: 'SoundBible', url: 'https://soundbible.com/' },
        { name: 'ZapSplat', url: 'https://www.zapsplat.com/' }
    ];
    
    sites.forEach(site => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = site.url;
        a.textContent = site.name;
        a.target = '_blank';
        li.appendChild(a);
        sources.appendChild(li);
    });
    
    step1.appendChild(sources);
    instructions.appendChild(step1);
    
    const step2 = document.createElement('li');
    step2.innerHTML = '<strong>Rename the files</strong> to match these names:';
    
    const files = document.createElement('ul');
    const soundFiles = [
        { name: 'engine.mp3', desc: 'A looping engine sound that works well when the playback rate is adjusted' },
        { name: 'wind.mp3', desc: 'A looping wind/air rushing sound' },
        { name: 'takeoff.mp3', desc: 'A short sound effect for when the plane takes off' },
        { name: 'landing.mp3', desc: 'A short sound effect for when the plane lands' }
    ];
    
    soundFiles.forEach(file => {
        const li = document.createElement('li');
        li.innerHTML = `<code>${file.name}</code> - ${file.desc}`;
        files.appendChild(li);
    });
    
    step2.appendChild(files);
    instructions.appendChild(step2);
    
    const step3 = document.createElement('li');
    step3.innerHTML = '<strong>Place the files</strong> in the <code>sounds</code> folder of the project.';
    instructions.appendChild(step3);
    
    const step4 = document.createElement('li');
    step4.innerHTML = '<strong>Open <code>index.html</code></strong> in your browser to play the simulator.';
    instructions.appendChild(step4);
    
    container.appendChild(instructions);
    
    const suggestedLinks = document.createElement('div');
    suggestedLinks.innerHTML = `
        <h2>Suggested Sound Links</h2>
        <p>Here are some specific suggestions for sound files (links may expire over time):</p>
        <ul>
            <li><strong>Engine Sound:</strong> <a href="https://freesound.org/people/ivolipa/sounds/337099/" target="_blank">Small Airplane Engine</a></li>
            <li><strong>Wind Sound:</strong> <a href="https://freesound.org/people/felix.blume/sounds/217506/" target="_blank">Wind Blowing</a></li>
            <li><strong>Takeoff Sound:</strong> <a href="https://freesound.org/people/SmartWentCody/sounds/179003/" target="_blank">Airplane Takeoff</a></li>
            <li><strong>Landing Sound:</strong> <a href="https://freesound.org/people/ivolipa/sounds/337063/" target="_blank">Airplane Landing</a></li>
        </ul>
        <p><em>Note: Please respect the licensing terms of any sound files you download.</em></p>
    `;
    container.appendChild(suggestedLinks);
    
    const backButton = document.createElement('a');
    backButton.href = 'index.html';
    backButton.textContent = 'Back to Simulator';
    backButton.style.display = 'inline-block';
    backButton.style.marginTop = '20px';
    backButton.style.padding = '10px 20px';
    backButton.style.backgroundColor = '#4CAF50';
    backButton.style.color = 'white';
    backButton.style.textDecoration = 'none';
    backButton.style.borderRadius = '4px';
    container.appendChild(backButton);
    
    document.body.appendChild(container);
});
