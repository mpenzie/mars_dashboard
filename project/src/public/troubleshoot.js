const Immutable = require('immutable')
const fetch = require("node-fetch")

const store = Immutable.Map({
  rovers: ['Curiosity', 'Opportunity', 'Spirit'],
  apod: '',
  curiosity: '',
  opportunity: '',
  spirit: '',
})



const updateStore = (store, newState) => {
    const newStore = store.merge(store, newState)
    store = Object.assign(store, newStore)
    render(store)
}

const render = async (state) => {
    console.log("render iteration: " + App(state));
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

  

    return renderTabContent(state, rovers);

}

const renderButtons = (state) => {
  const rovers = state.get('rovers');

  let finalHtmlArray = [];

  Array.prototype.forEach.call(rovers, rover => {
      finalHtmlArray.push(`
              <button class="tablink" onclick="openPage('${rover}', this, 'blue')">${rover}</button>`)
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
              <div class="mySlides${rover} fade">
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


const getRoverApi = () => {
   
  Array.prototype.forEach.call(store.get("rovers"), rover => {
    fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=hcOaEvoqcUsGAThVQ9H79yzK6c7zwE0p8CG8SYVt`)
        .then(res => res.json())
        .then(roverApi => {
        	const newStore = store.set(rover.toLowerCase(), roverApi);
  			  updateStore(store, newStore);
      	})
        .catch(error => console.error(error));

  });
     
}


//------Functions for UI features

getRoverApi();
render(store);
