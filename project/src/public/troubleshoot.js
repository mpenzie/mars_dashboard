const Immutable = require('immutable')
const fetch = require("node-fetch")

const store = Immutable.Map({
    selectedRover: 'Curiosity',
  	roverInfo: '',
  	roverImages: '',
  	roverApi: {"latest_photos":[{"id":318477,"sol":2208,"camera":{"id":30,"name":"PANCAM","rover_id":7,"full_name":"Panoramic Camera"},"img_src":"http://mars.nasa.gov/mer/gallery/all/2/p/2208/2P322473707ESFB27MP2600L8M1-BR.JPG","earth_date":"2010-03-21","rover":{"id":7,"name":"Spirit","landing_date":"2004-01-04","launch_date":"2003-06-10","status":"complete"}},{"id":318478,"sol":2208,"camera":{"id":30,"name":"PANCAM","rover_id":7,"full_name":"Panoramic Camera"},"img_src":"http://mars.nasa.gov/mer/gallery/all/2/p/2208/2P322473707ESFB27MP2600R8M1-BR.JPG","earth_date":"2010-03-21","rover":{"id":7,"name":"Spirit","landing_date":"2004-01-04","launch_date":"2003-06-10","status":"complete"}}]},
  	apod: '',
})



const updateStore = (store, newState) => {
    const newStore = store.merge(store, newState)
    store = Object.assign(store, newStore)
    render(store)
}

const render = async (state) => {
    App(state)
}

const App = (state) => {
    const selectedRover = state.get('selectedRover')
    
  	return `
        <header></header>
        <main>
            <section>
                <h3>Let's view a Mars rover!</h3>
                <p>
                    Select one of the available tabs below to view the information and slideshow for that Mars Rover.
                </p>
            	<button class="tablink" onclick="openPage('Curiosity', this, 'blue')">Curiosity</button>
				<button class="tablink" onclick="openPage('Opportunity', this, 'blue')">Opportunity</button>
				<button class="tablink" onclick="openPage('Spirit', this, 'blue')">Spirit</button>
            </section>
            
            ${renderTabContent(state, selectedRover)}
        </main>
        
        <footer></footer>
    `
	
}



// ------------------------------------------------------  COMPONENTS

//Higher Order Function for content to render in tab display
const renderTabContent = (state, selectedRover) => {
 	    
    return `
    	<div id="${selectedRover}" class="tabcontent">
  			${roverInfo(state, selectedRover)}
        	<div class="slideshow-container">
            ${roverImages(state, selectedRover)}
        	<!-- Next and previous buttons -->
  			<a class="prev" onclick="plusSlides(-1)">&#10094;</a>
  			<a class="next" onclick="plusSlides(1)">&#10095;</a>
			</div>
		</div>
    `
}



const roverImages = (state, rover) => {
  const roverImages = state.get('roverImages')
      
  let finalHtmlArray = []
  
  Array.prototype.forEach.call(roverImages, (entry, i) => {
    let index = i+1;
    finalHtmlArray.push(`
    	<div class="mySlides fade">
        	<div class="numbertext">${index} / ${roverImages.length}</div>
  			<img src="${entry.img_src}" height="145px" width="100%" />
			<div class="text">${entry.earth_date}</div>
        </div>
        `)
    
  })
  
  return finalHtmlArray.join('')
 
  
}

const roverInfo = (state, rover) => {
  const roverInfo = state.get('roverInfo')  

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

const convertRoverInfo = (roverApi) => {
  console.log('roverApi:' + JSON.stringify(roverApi))
  const photosArray = roverApi.latest_photos
  console.log('photosArray:' + JSON.stringify(photosArray))

  let roverInfo = {}
    roverInfo["name"] = photosArray[0].rover.name
    roverInfo["landing_date"] = photosArray[0].rover.landing_date
    roverInfo["launch_date"] = photosArray[0].rover.launch_date
    roverInfo["status"] = photosArray[0].rover.status
    
  const newStore = store.set("roverInfo", roverInfo)
  updateStore(store, newStore)
  
  let roverImages = photosArray.map(obj => {
    let newObj = {}
    newObj["img_src"] = obj.img_src
    newObj["earth_date"] = obj.earth_date
    return newObj
  })
  
  const newStoreImage = store.set("roverImages", roverImages)
  updateStore(store, newStoreImage)

}


// ------------------------------------------------------  API CALLS


const getRoverApi = async (rover) => {
      console.log('enter getRoverApi for rover: ' + rover)

      try{
        await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover.toLowerCase()}/latest_photos?api_key=hcOaEvoqcUsGAThVQ9H79yzK6c7zwE0p8CG8SYVt`)
        .then(res => res.json())
        .then(roverApi => {
          console.log('api response' + JSON.stringify(roverApi))
        	const newStore = store.set("roverApi", roverApi)
  			  updateStore(store, newStore)
      	})
      }
      catch (err) {
        console.log('error:', err);
      }
      
        
     
}


//------Functions for UI features


function openPage(rover, elmnt, color) {
  
  const newStore = store.set("selectedRover", rover)
  updateStore(store, newStore);
  
    
  getRoverApi(rover)
  
  const roverApi = store.get('roverApi')
  convertRoverInfo(roverApi)
  render(store)
}

const rover = store.get('selectedRover')
  	getRoverApi(rover)
  
  	const roverApi = store.get('roverApi')
  	convertRoverInfo(roverApi)
  	render(store)
openPage('Opportunity', this, 'blue')

console.log(App(store))