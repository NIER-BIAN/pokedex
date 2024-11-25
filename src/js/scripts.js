/*

  Main logic calls:
  
  - songRepository.loadSongsFromAPI()
  - songRepository.getAllSongs()
  - songRepository.showSongButton()
  
  further calls from here:
  showSongButton ->  addButtonEventHandler() -> showDetails -> loadDetailsFromAPI & showModal() -> loadDetailsFromAPI

*/

//==================================================================================

/* 1. tweak name cos PokeAPI didn't capitalise first letter */

// Called by loadSongsFromAPI and showModal
function nameTweaker (name) {
    tweakedName = name.charAt(0).toUpperCase() + name.slice(1);
    return tweakedName;
}

//==================================================================================

/* 2. songRepository IIFE  */

let songRepository = (function () {
    
    let songList = [];
    let apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';
    
    //---------------------------------------------------------------------------
    // hide loading message for loadSongsFromAPI()

    function hideLoadingMessage() {
	let container = document.querySelector('.loading-message-wrapper');
	let loadingMessage = document.querySelector('.lds-dual-ring');
	container.removeChild(loadingMessage);	
    }

    function showModalLoadingMessage() {
	let loadingMessage = document.createElement('h3');
	let container = document.querySelector('.modal-loading-message-wrapper');
	loadingMessage.innerText = 'Loading. Please wait!';
	loadingMessage.classList.add('loading-message');
	container.appendChild(loadingMessage);
    }
    
    function hideModalLoadingMessage() {
	let container = document.querySelector('.modal-loading-message-wrapper');
	let loadingMessage = document.querySelector('.loading-message');
	container.removeChild(loadingMessage);	
    }

    //---------------------------------------------------------------------------
    // find
    
    function find(searchTerm) {
	
	// anonymous arrow function
	// takes in parameter 'song' and returns true if name matches searchterm
	// filter() method of Array instances then shallow copies that portion
	result = songList.filter((song) => song.name == searchTerm);

	if (result.length === 0) {
	    return 'We found nothing.';
	}
	
	return result;
    }
    
    //---------------------------------------------------------------------------
    // Func called by main logic 3 of 3: songRepository.showSongButton()
    
    function loadDetailsFromAPI(item) {
		
	let url = item.detailsUrl;

	//fetch returns promise
	return fetch(url).then(function (response) {
	    
	    return response.json();
	    
	}).then(function (details) {
	    
	    hideModalLoadingMessage();

	    // Now we add the details to the song
	    item.imageUrl = details.sprites.front_default;
	    item.height = details.height;
	    item.weight = details.weight;
	    item.types = details.types;
	    
	}).catch(function (errorMessage) {

	    hideModalLoadingMessage();
	    console.error(errorMessage);
	    
	});
    }

    function showModal(song) {

	// query for appropriate space to fill in DOM
	let modalTitle = $('.modal-title');
	let modalBody = $('.modal-body');

	let name = $('<h1>' + song.name + '</h1>');
	modalTitle.append(name);
	
	let image = $('<img class="modal-img" style="width:100%">');
	image.attr('src', song.imageUrl);
	modalBody.append(image);
	
	let height = $('<p>' + 'Height: ' + song.height + '</p>');
	modalBody.append(height);
	
	let weight = $('<p>' + 'Weight: ' + song.weight + '</p>');
	modalBody.append(weight);

	let typesArray = song.types.map((type) => type.type.name).join(', ')
	let types = $('<p>' + 'Types: ' + typesArray + '</p>');
	modalBody.append(types);
    }

    function showDetails(song) {

	// loadDetailsFromAPI returns a promise
	// the console.log(song) statement is placed inside the .then() method to ensure
	// details have been loaded before logging i.e. wait for asynchronous operation of fetch
	loadDetailsFromAPI(song).then(function () {
	    showModal(song);
	})
    }

    // function to be passed to addListItem
    function addButtonEventHandler(button, song) {
	button.addEventListener('click', function() {

	    showModalLoadingMessage();
	    
	    // Get a head start on empty old modal
	    // query for appropriate space to fill in DOM
	    let modalTitle = $('.modal-title');
	    let modalBody = $('.modal-body');
	    // empty what's been there before
	    modalTitle.empty();
	    modalBody.empty();
	    
	    showDetails(song);
	})
    }
    
    function showSongButton(song) {
	
	let container = document.querySelector('.song-list');
	let listItem = document.createElement('li');
	listItem.classList.add('col-10');
	listItem.classList.add('col-sm-5');
	listItem.classList.add('col-md-3');
	listItem.classList.add('col-lg-2');
	listItem.classList.add('col-xlg-1');
	
	// Button
	let button = document.createElement('button');
	button.innerText = song.name;
	button.setAttribute('data-toggle', "modal");
	button.setAttribute('data-target', "#exampleModal");
	
	listItem.appendChild(button);
	container.appendChild(listItem);

	// Button event handler
	addButtonEventHandler(button, song);
    }
    
    //---------------------------------------------------------------------------
    // Func called by main logic 2 of 3: songRepository.getAllSongs()

    function getAllSongs() {
	return songList;
    }

    //---------------------------------------------------------------------------
    // Func called by main logic 1 of 3: songRepository.loadSongsFromAPI()

    function pushToSongList(song) {
	
	/* Check if object*/
	if (typeof(song) !== 'object') {
	    return 'Added item must be object.';
	}

	/* Check if contains right fields*/
	// expectedFields = ['name', 'album', 'year', 'category'].toString();
	// songKeys = Object.keys(song).toString();
	// if (songKeys !== expectedFields) {
	//    return 'Added item must contain the fields name, album, year, and category.';
	//}

	songList.push(song);
    }
    
    function loadSongsFromAPI() {
	
	//fetch returns promise
	return fetch(apiUrl).then(function (response) {

	    return response.json();
	    
	}).then(function (json) {

	    hideLoadingMessage();
	    json.results.forEach(function (item) {

		//create song
		let song = {
		    name: nameTweaker(item.name),
		    //loadDetailsFromAPI() will take detailsUrl as arg
		    detailsUrl: item.url
		};

		// push to songList
		pushToSongList(song);
	    });
	    
	}).catch(function (errorMessage) {

	    hideLoadingMessage();
	    console.error(errorMessage);
	    
	})
    }
    
    //---------------------------------------------------------------------------
    
    return {

	// Called in main logic
	loadSongsFromAPI: loadSongsFromAPI,
	getAllSongs: getAllSongs,
	showSongButton: showSongButton,
	
	find: find

    };

})();

//==================================================================================

/* 3. Main logic: List out all songs */

//loadSongsFromAPI() contacts API and pushes to songList
songRepository.loadSongsFromAPI().then(function() {
    
    // getAllSongs() returns songList
    songRepository.getAllSongs().forEach(function(pokemon){
	// for each song in songList, a button is created
	songRepository.showSongButton(pokemon);
    });
});
