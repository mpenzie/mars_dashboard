const store = Immutable.Map({
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
  	apod: '',
    curiosity: '',
    opportunity: '',
    spirit: '',
})

//starting reference for slideshow controls
let slideIndex = [1, 1, 1];

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
                <br>
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

  getRoverApi();
   	  	
})

// ------------------------------------------------------  COMPONENTS

//Higher Order Function to generate tabs
const renderTabs = (state) => {
  const rovers = state.get('rovers');

  return renderTabContent(state, rovers);

}

//generate HTML for tab content. The tabs for all 3 rovers are generated before they are viewed.
//Tab content includes rover info (name, launch/landing date, status) and slide show of rover images
const renderTabContent = (state, rovers) => {
    let finalHtmlArray = [];
    
    Array.prototype.forEach.call(rovers, rover => {
        finalHtmlArray.push(`
          <div id="${rover}" class="tabcontent">
  			    ${roverInfo(state, rover)}
            <br>
        	  <div class="slideshow-container">
              
              ${roverImages(state, rover)}
        	    
              <!-- Next and previous buttons -->
  			      <a class="prev" onclick="plusSlides(-1, '${rover}')">&#10094;</a>
  			      <a class="next" onclick="plusSlides(1, '${rover}')">&#10095;</a>
			      </div>
		      </div>
        `)
    })


    return finalHtmlArray.join('');
}


//generate HTML to display tabs with the rover names
const renderButtons = (state) => {
    const rovers = state.get('rovers');

    let finalHtmlArray = [];

    Array.prototype.forEach.call(rovers, rover => {
        finalHtmlArray.push(`
              <button class="tablink" onclick="openPage('${rover}', this, 'blue')">${rover}</button>`
              )
      })

      return finalHtmlArray.join('');

}


//generate HTML to display rover images in a slide show (this function adds a slide for each image)
const roverImages = (state, rover) => {
    const roverApi = state.get(rover.toLowerCase());
    
    
    if (!roverApi || !roverApi.roverApi.latest_photos)
        return ``;
    
    const photosArray = roverApi.roverApi.latest_photos;

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
              <div class="mySlides${rover} fade">
        	      <div class="numbertext">${index} / ${roverImages.length}</div>
  			        <img src="${entry.img_src}" style="width:100%">
			          <div class="text">${entry.earth_date}</div>
              </div>
        `)
    
  })
  return finalHtmlArray.join('');
 
  
}

//generate HTML to display basic rover info: name, landing date, launch date, status
const roverInfo = (state, rover) => {
    const roverApi = state.get(rover.toLowerCase());
    
    if (!roverApi || !roverApi.roverApi.latest_photos)
        return ``;

    const photosArray = roverApi.roverApi.latest_photos;
    
    let roverInfo = {};
    roverInfo["name"] = photosArray[0].rover.name;
    roverInfo["landing_date"] = photosArray[0].rover.landing_date;
    roverInfo["launch_date"] = photosArray[0].rover.launch_date;
    roverInfo["status"] = photosArray[0].rover.status;

  return(
    `
            <h3>${roverInfo.name}</h3>
            <p>Landing Date: ${roverInfo.landing_date}</p>
    	      <p>Launch Date: ${roverInfo.launch_date}</p>
    	      <p>Rover Status: ${roverInfo.status}</p>
  `)
  
}



// ------------------------------------------------------  API CALLS


const getRoverApi = () => {
   
  //pull the API for all 3 rovers and store in it's respective value in store
  Array.prototype.forEach.call(store.get("rovers"), rover => {
    fetch(`http://localhost:3000/rover/${rover}`)
        .then(res => res.json())
        .then(roverApi => {
        	const newStore = store.set(rover.toLowerCase(), roverApi);
  			  updateStore(store, newStore);
      	})
        .catch(error => console.error(error));

  });
     
}


//------Functions for UI features


// Next/previous controls
function plusSlides(n, rover) {
  //decide which value in slideIndex to use
  let no;

  if (rover === 'Curiosity') {
    no = 0;
  } else if (rover === 'Opportunity') {
    no = 1;
  } else {
    no = 2;
  }
  showSlides(slideIndex[no] += n, rover);
}

//Slide UI display function
function showSlides(n, rover) {
  let i;
  let no;

  //decide which value in slideIndex to use
  if (rover === 'Curiosity'){
    no = 0;
  }else if (rover === 'Opportunity'){
    no = 1;
  } else {
    no = 2;
  }

  const slides = document.getElementsByClassName("mySlides"+rover);

  if (n > slides.length) {slideIndex[no] = 1}
  if (n < 1) {slideIndex[no] = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  slides[slideIndex[no]-1].style.display = "block";
}

//function to open tab
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

  //decide which value in slideIndex to use
  let no;

  if (rover === 'Curiosity') {
    no = 0;
  } else if (rover === 'Opportunity') {
    no = 1;
  } else {
    no = 2;
  }

  //each time the tab is open, open the first slide
  slideIndex[no] = 1;

  //generate slideshow
  showSlides(slideIndex[no], rover);
  
  }
