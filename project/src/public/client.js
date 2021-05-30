
const store = Immutable.Map({
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
  	apod: '',
    curiosity: '',
    opportunity: '',
    spirit: '',
})


// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, newState) => {
    const newStore = store.merge(store, newState);
    store = Object.assign(store, newStore);
    render(root, store);
}

const render = async (root, state) => {
    root.innerHTML = App(state);
}

const App = (state) => {
        
  	return `
        <header>Let's view a Mars rover!</header>
        <main>
            <section>
                <p>
                    Select one of the available tabs below to view the information and slideshow for that Mars Rover.
                </p>
            	${renderButtons(state)}
            </section>
            
            ${renderTabs(state)}
        </main>
        
        <footer></footer>
    `
	
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
   	  	
})

// ------------------------------------------------------  COMPONENTS


const renderTabContent = (state, rovers) => {
    let finalHtmlArray = [];
    Array.prototype.forEach.call(rovers, rover => {
        finalHtmlArray.push(`
            <div id="${rover}" class="tabcontent">
  			    ${roverInfo(state, rover)}
        	    <div class="slideshow-container">
                ${roverImages(state, rover)}
        	    <!-- Next and previous buttons -->
  			    <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
  			    <a class="next" onclick="plusSlides(1)">&#10095;</a>
			    </div>
		    </div>
        `)
    })


    return finalHtmlArray.join('');
}

//Higher Order Function to generate tabs
const renderTabs = (state) => {
    const rovers = state.get('rovers');

    Array.prototype.forEach.call(rovers, rover => {
        getRoverApi(rover);

        
      })

      return renderTabContent(state, rovers);

}

const renderButtons = (state) => {
    const rovers = state.get('rovers');

    let finalHtmlArray = [];

    Array.prototype.forEach.call(rovers, rover => {
        finalHtmlArray.push(`
        <button class="tablink" onclick="openPage('${rover}', this, 'blue')">${rover}</button>
        `)
      })

      return finalHtmlArray.join('');

}



const roverImages = (state, rover) => {
    const roverApi = state.get(rover.toLowerCase());
    
    if (!roverApi || !roverApi.latest_photos)
        return ``;
    
    const photosArray = roverApi.latest_photos;

    const roverImages = photosArray.map(obj => {
        let newObj = {};
        newObj["img_src"] = obj.img_src;
        newObj["earth_date"] = obj.earth_date;
        return newObj;
      })
      
  let finalHtmlArray = [];
  
  Array.prototype.forEach.call(roverImages, (entry, i) => {
    const index = i+1;
    finalHtmlArray.push(`
    	<div class="mySlides fade">
        	<div class="numbertext">${index} / ${roverImages.length}</div>
  			<img src="${entry.img_src}" height="145px" width="100%" />
			<div class="text">${entry.earth_date}</div>
        </div>
        `)
    
  })
  
  return finalHtmlArray.join('');
 
  
}

const roverInfo = (state, rover) => {
    const roverApi = state.get(rover.toLowerCase());

    if (!roverApi || !roverApi.latest_photos)
        return ``;

    const photosArray = roverApi.latest_photos;

    let roverInfo = {};
    roverInfo["name"] = photosArray[0].rover.name;
    roverInfo["landing_date"] = photosArray[0].rover.landing_date;
    roverInfo["launch_date"] = photosArray[0].rover.launch_date;
    roverInfo["status"] = photosArray[0].rover.status;

  return(
    `
  	<h3>${roverInfo.name}</h3>
    <p>
    	Landing Date: ${roverInfo.landing_date}
    	Launch Date: ${roverInfo.launch_date}
    	Rover Status: ${roverInfo.status}
    </p>
  `)
  
}



// ------------------------------------------------------  API CALLS


const getRoverApi = async (rover) => {
   
      await fetch(`http://localhost:3000/rover/${rover}`)
        .then(res => res.json())
        .then(roverApi => {
        	const newStore = store.set(rover.toLowerCase(), roverApi);
  			updateStore(store, newStore);
      	})
        .catch(error => console.error(error));
     
}


//------Functions for UI features

let slideIndex = 1;


// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  const slides = document.getElementsByClassName("mySlides");

  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  slides[slideIndex-1].style.display = "block";
}

function openPage(rover, elmnt, color) {
  
  
  // Hide all elements with class="tabcontent" by default */
  let i;
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove the background color of all tablinks/buttons
  const tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }

  // Show the specific tab content
  document.getElementById(rover).style.display = "block";
  
  // Add the specific color to the button used to open the tab content
  elmnt.style.backgroundColor = color;

  showSlides(slideIndex);
  
  }
