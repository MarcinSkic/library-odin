import './style.css'
import A11yDialog from 'a11y-dialog';

"use strict"
class PieceOfWork{

    constructor (title,creator,isCompleted){
        this.title = title;
        this.creator = creator;
        this.isCompleted = isCompleted;
    }

    static deleteWorkFromList(index){
        this.list.splice(index,1);
    }
    
    static changeWorkState(index){
        return this.list[index].toggleCompletedState();
    }
    
    toggleCompletedState(){
        this.isCompleted = !this.isCompleted;
        return this.isCompleted;
    }
}

class Book extends PieceOfWork{
    static list  = [];

    constructor (title,creator,isCompleted,numberOfPages){
        super(title,creator,isCompleted);

        this.numberOfPages = numberOfPages;
    }
}

class Movie extends PieceOfWork{
    static list  = [];

    constructor (title,creator,isCompleted,numberOfViewings,seenInCinema){
        super(title,creator,isCompleted);

        this.numberOfViewings = numberOfViewings;
        this.seenInCinema = seenInCinema;
    }
}

class ComputerGame extends PieceOfWork {
    static list = [];

    constructor (title,creator,isCompleted,hoursPlayed){
        super(title,creator,isCompleted);

        this.hoursPlayed = hoursPlayed;
    }
}

const mainController = (function(){
    function init(){
        storageController.importFromStorage();
        displayController.generateWorkTypeForm({target: {value: "book"}});
        displayController.refreshCollection();
        displayController.initWorkPickDialog();

        assignListeners();
    }

    function assignListeners(){
        document.querySelectorAll('.pick-type').forEach(button => button.addEventListener('click',displayController.generateWorkTypeForm));
        document.querySelectorAll('.star').forEach(star => star.addEventListener('click',displayController.selectRating));
    }

    return {init};
})();

const storageController = (function(){
    const STORAGE_KEY = "piecesOfWork";

    function importFromStorage(){
        let importedLists = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if(importedLists === null || importedLists === undefined){
            //NOTHING?
        } else {
            Book.list = importedLists.books.map(object => Object.assign(new Book(),object));
            Movie.list = importedLists.movies.map(object => Object.assign(new Movie(),object));
            ComputerGame.list = importedLists.computerGames.map(object => Object.assign(new ComputerGame(),object));
        }
    }

    function saveToStorage(){
        const piecesOfWork = {books: Book.list,movies: Movie.list,computerGames: ComputerGame.list}
        localStorage.setItem(STORAGE_KEY,JSON.stringify(piecesOfWork));
    }

    return {importFromStorage,saveToStorage};
})();

const piecesOfWorkController = (function(){

    function addPieceOfWorkToLibrary(event){
        event.preventDefault(); //To cancel form submition refreshing page
        const workType = event.target.dataset.type;
    
        const {title,creator,isCompleted} = displayController.getPieceOfWorkFormData();
        
        switch(workType){
            case "book":
                const {numberOfPages} = displayController.getBookFormData();

                Book.list.push(new Book(title,creator,isCompleted,numberOfPages));
                break;
            case 'movie':
                const {numberOfViewings,seenInCinema} = displayController.getMovieFormData();

                Movie.list.push(new Movie(title,creator,isCompleted,numberOfViewings,seenInCinema));
                break;
            case 'computer-game':
                const {hoursPlayed} = displayController.getComputerGameFormData();

                ComputerGame.list.push(new ComputerGame(title,creator,isCompleted,hoursPlayed));
                break;
        }
        
        storageController.saveToStorage();
        displayController.refreshCollection();
    }
    
    function deletePieceOfWork(pieceOfWorkClass,index){  //TODO, probably should be in class?

        pieceOfWorkClass.deleteWorkFromList(index);
    
        storageController.saveToStorage();
    
        displayController.refreshCollection();
    }

    return {addPieceOfWorkToLibrary,deletePieceOfWork};
})();

const displayController = (function(){

    const DOM_CLASS_INDEX_IN_CLASSLIST = 1;

    const WORK_FORM_FRAMEWORK = `
    <form class="add-new-piece-of-work" action="#">
        <div>
            <label for="title">Title</label>
            <input type="text" id="title" name="title">
        </div>
        <div>
            <label for="creator">Creator</label>
            <input type="text" id="creator" name="creator" placeholder="Author, director or developer">
        </div>
        <div>
            <label for="is-completed">Completed</label>
            <input type="checkbox" name="is-completed" id="is-completed">
        </div>
    </form>`;

    const BOOK_FORM_EXTRA = `
    <div>
        <label for="number-of-pages">Number of pages</label>
        <input type="number" min="0" name="number-of-pages" id="number-of-pages">
    </div>`

    const MOVIE_FORM_EXTRA = `
    <div>
        <label for="number-of-viewings">Number of viewings</label>
        <input type="number" min="0" name="number-of-viewings" id="number-of-viewings">
    </div>
    <div>
        <label for="seen-in-cinema">Seen in cinema</label>
        <input type="checkbox" name="seen-in-cinema" id="seen-in-cinema">
    </div>
    `

    const COMPUTER_GAME_FORM_EXTRA = `
    <div>
        <label for="hours-played">Hours played</label>
        <input type="number" min="0" name="hours-played" id="hours-played">
    </div>`

    function initWorkPickDialog(){
        const dialogContainer = document.getElementById('create-work-dialog');
        console.log(dialogContainer);
        const dialog = new A11yDialog(dialogContainer);

        dialog.show();
    }

    function generateWorkTypeForm(event){
        const workType = event.target.value;

        const formContainer = document.querySelector('.form-container');
        formContainer.innerHTML = "";

        const form = stringToNode(WORK_FORM_FRAMEWORK)[0];
        form.dataset.type = workType;
        form.addEventListener('submit',piecesOfWorkController.addPieceOfWorkToLibrary);

        switch(workType){
            case 'book':
                form.append(...stringToNode(BOOK_FORM_EXTRA));
                break;
            case 'movie':
                form.append(...stringToNode(MOVIE_FORM_EXTRA));
                break;
            case 'computer-game':
                form.append(...stringToNode(COMPUTER_GAME_FORM_EXTRA));
                break;
        }

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = "Add to collection";

        form.append(submitButton);

        formContainer.append(form);
    }

    function changeWorkState(event){
        const pieceOfWorkElement = event.target.closest('.card');

        const index = pieceOfWorkElement.dataset.index;
        const pieceOfWorkClass = parseNodeClass(pieceOfWorkElement.classList[DOM_CLASS_INDEX_IN_CLASSLIST]) ;

        const newState = pieceOfWorkClass.changeWorkState(index);
    
        event.target.textContent = newState ? 'V' : 'X'; //TODO
    
        storageController.saveToStorage();
    }
    

    function generateLibraryCollection(){
        const booksContainer = document.querySelector(".container.books");
    
        Book.list.forEach((work,index) => { //TODO temp
            const book = createPieceOfWorkFrameworkElement(work,index,'book');

            const numberOfPages = document.createElement('div');
            numberOfPages.classList.add('number-of-pages');
            numberOfPages.textContent = work.numberOfPages;

            book.append(numberOfPages);
            
            addButtonsToPieceOfWork(work,book);
            
            booksContainer.append(book);
        });

        const moviesContainer = document.querySelector('.container.movies');

        Movie.list.forEach((work,index) => {
            const movie = createPieceOfWorkFrameworkElement(work,index,'movie');

            const numberOfViewings = document.createElement('div');
            numberOfViewings.classList.add('number-of-viewings');
            numberOfViewings.textContent = work.numberOfViewings;

            const seenInCinema = document.createElement('div');
            seenInCinema.classList.add('seen-in-cinema');
            seenInCinema.textContent = `Seen in cinema: ${work.seenInCinema ? 'V' : 'X'}`;

            movie.append(numberOfViewings,seenInCinema);

            addButtonsToPieceOfWork(work,movie);

            moviesContainer.append(movie);
        });

        const computerGamesContainer = document.querySelector('.container.computer-games');

        ComputerGame.list.forEach((work,index) => {
            const computerGame = createPieceOfWorkFrameworkElement(work,index,'computer-game');

            const hoursPlayed = document.createElement('div');
            hoursPlayed.classList.add('hours-played');
            hoursPlayed.textContent = work.hoursPlayed;

            computerGame.append(hoursPlayed);

            addButtonsToPieceOfWork(work,computerGame);

            computerGamesContainer.append(computerGame);
        });
        
    } 

    function createPieceOfWorkFrameworkElement(work,index,workStringClass){
        const workElement = document.createElement("div");
        workElement.classList.add('card',workStringClass);
        workElement.dataset.index = index;

        const title = document.createElement('div');
        title.classList.add('title');
        title.textContent = work.title;
        
        const creator = document.createElement('div');
        creator.classList.add('creator');
        creator.textContent = work.creator;

        workElement.append(title,creator);

        return workElement;
    }

    function addButtonsToPieceOfWork(work,workElement){

        const completeButton = document.createElement('button');
        completeButton.classList.add('mark-completed');
        completeButton.textContent = work.isCompleted ? 'V' : 'X';
        completeButton.addEventListener('click',changeWorkState);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener('click',warnAboutDeletion, {capture: true});

        workElement.append(completeButton,deleteButton);
    }

    function warnAboutDeletion(event){

        const deleteButton = event.target;
    
        deleteButton.textContent = "Are you sure?"
        
        const func = tryToDelete.bind(deleteButton);
        window.addEventListener('click',func,{once: true, capture:true});
    
        deleteButton.removeEventListener('click',warnAboutDeletion, {capture: true});
    }
    
    function tryToDelete(event){
        const lastClickedDeleteButton = this;
        const clickedElement = event.target;
        
        if(lastClickedDeleteButton.isEqualNode(clickedElement)){
            const pieceOfWorkClass = parseNodeClass(lastClickedDeleteButton.closest('.card').classList[DOM_CLASS_INDEX_IN_CLASSLIST]);
            const index = lastClickedDeleteButton.closest('.card').dataset.index;

            piecesOfWorkController.deletePieceOfWork(pieceOfWorkClass,index);
        } else {
            lastClickedDeleteButton.textContent = "Delete";
            lastClickedDeleteButton.addEventListener('click',warnAboutDeletion, {capture: true});
        }
    }
    
    function refreshCollection(){
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => container.innerHTML = "");
    
        generateLibraryCollection();
    }

    function getPieceOfWorkFormData(){

        const title = document.getElementById("title").value;
        const creator = document.getElementById('creator').value;
        const isCompleted = document.getElementById('is-completed').checked;

        return {title,creator,isCompleted};
    }

    function getBookFormData(){
        const numberOfPages = document.getElementById('number-of-pages').value;

        return {numberOfPages};
    }

    function getMovieFormData(){
        const numberOfViewings = document.getElementById('number-of-viewings').value;
        const seenInCinema = document.getElementById('seen-in-cinema').checked;
        
        return {numberOfViewings,seenInCinema};
    }

    function getComputerGameFormData(){
        const hoursPlayed = document.getElementById('hours-played').value;

        return {hoursPlayed};
    }

    const stringToNode = function(string){
        const template = document.createElement('template');
        string = string.trim();
        template.innerHTML = string;
        return template.content.childNodes;
    }

    function parseNodeClass(stringClass){
        switch(stringClass){
            case 'book':
                return Book;
            case 'movie':
                return Movie;
            case 'computer-game':
                return ComputerGame;
        }
    }

    function selectRating(event){
        const ratingBar = event.currentTarget.parentNode;

        [...ratingBar.children].forEach(node => {
            node.classList.remove('selected');
        });

        event.currentTarget.classList.add('selected');
    }

    return {refreshCollection,generateWorkTypeForm,getPieceOfWorkFormData,getBookFormData,getMovieFormData,getComputerGameFormData,initWorkPickDialog,selectRating};
})();

mainController.init();