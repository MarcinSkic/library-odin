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
        assignListeners();
        displayController.refreshCollection();
    }

    function assignListeners(){
        document.querySelector(".add-new-piece-of-work").addEventListener('submit',piecesOfWorkController.addPieceOfWorkToLibrary);
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
    
        const {workType,title,creator,isCompleted} = displayController.getPieceOfWorkFormData();
        
        switch(workType){
            case "book":
                const book = new Book(title,creator,isCompleted,0);
                Book.list.push(book);
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

    function changeWorkState(event){
        const pieceOfWorkElement = event.target.closest('.card');

        const index = pieceOfWorkElement.dataset.index;
        const pieceOfWorkClass = parseNodeClass(pieceOfWorkElement.classList[DOM_CLASS_INDEX_IN_CLASSLIST]) ;

        const newState = pieceOfWorkClass.changeWorkState(index);
    
        event.target.textContent = newState ? 'V' : 'X'; //TODO
    
        storageController.saveToStorage();
    }
    

    function generateLibraryCollection(){
        const container = document.querySelector(".container.books");
    
        Book.list.forEach((work,index) => { //TODO temp
            const book = createSharedWorkElements(work,index,'book');
            
            container.append(book);
        })
    }

    function createSharedWorkElements(work,index,workStringClass){
        const workElement = document.createElement("div");
        workElement.classList.add('card',workStringClass);
        workElement.dataset.index = index;

        const title = document.createElement('div');
        title.classList.add('title');
        title.textContent = work.title;
        
        const creator = document.createElement('div');
        creator.classList.add('creator');
        creator.textContent = work.creator;

        const completeButton = document.createElement('button');
        completeButton.classList.add('mark-completed');
        completeButton.textContent = work.isCompleted ? 'V' : 'X';
        completeButton.addEventListener('click',changeWorkState);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener('click',warnAboutDeletion, {capture: true});

        workElement.append(title,creator,completeButton,deleteButton);

        return workElement;
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
        const workType = document.getElementById("type").value;

        const title = document.getElementById("title").value;
        const creator = document.getElementById('creator').value;
        const isCompleted = document.getElementById('is-completed').checked;

        return {workType,title,creator,isCompleted};
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

    return {refreshCollection,getPieceOfWorkFormData};
})();

mainController.init();