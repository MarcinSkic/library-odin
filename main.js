"use strict"

let piecesOfWorkList = [];

class PieceOfWork{
    constructor (title,creator,isCompleted){
        this.title = title;
        this.creator = creator;
        this.isCompleted = isCompleted;
    }
    
    toggleCompletedState(){
        this.isCompleted = !this.isCompleted;
    }
}

class Book extends PieceOfWork{
    static books;

    constructor (title,creator,isCompleted,numberOfPages){
        super(title,creator,isCompleted);

        this.numberOfPages = numberOfPages;
    }
}

class ComputerGame extends PieceOfWork {
    static computerGames;

    constructor (title,creator,isCompleted,hoursPlayed){
        super(title,creator,isCompleted);

        this.hoursPlayed = hoursPlayed;
    }
}

class Movie extends PieceOfWork{

    static movies;

    constructor (title,creator,isCompleted,numberOfViewings,seenInCinema){
        super(title,creator,isCompleted);

        this.numberOfViewings = numberOfViewings;
        this.seenInCinema = seenInCinema;
    }
}

const storageController = (function(){
    const STORAGE_KEY = "piecesOfWork";

    function importFromStorage(){
        let importedList = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if(importedList === null || importedList === undefined){
            piecesOfWorkList = [];
        } else {
            piecesOfWorkList = importedList;
        }
        piecesOfWorkList = piecesOfWorkList.map(object => Object.assign(new PieceOfWork(),object));
    }


    function saveToStorage(){
        localStorage.setItem(STORAGE_KEY,JSON.stringify(piecesOfWorkList));
    }

    return {importFromStorage,saveToStorage};
})();

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


const piecesOfWorkController = (function(){
    function addPieceOfWorkToLibrary(event){
        event.preventDefault(); //To cancel form submition refreshing page
    
        let pieceOfWork = null;
    
        const {workType,title,creator,isCompleted} = displayController.getPieceOfWorkFormData();
        
        switch(workType){
            case "book":
                pieceOfWork = new PieceOfWork(title,creator,isCompleted);
                console.log(pieceOfWork);
                break;
        }
    
        piecesOfWorkList.push(pieceOfWork);
        storageController.saveToStorage();
        displayController.refreshCollection();
    }
    
    function deletePieceOfWork(index){
        piecesOfWorkList.splice(index,1);
    
        storageController.saveToStorage();
    
        displayController.refreshCollection();
    }

    return {addPieceOfWorkToLibrary,deletePieceOfWork};
})();

const displayController = (function(){

    function changePieceState(event){
        let index = event.target.closest('.card').dataset.index;
        piecesOfWorkList[index].toggleCompletedState();
    
        event.target.textContent = piecesOfWorkList[index].isCompleted ? 'V' : 'X'; //TODO
    
        storageController.saveToStorage();
    }
    

    function generateLibraryCollection(){
        const container = document.querySelector(".container.books");
    
        piecesOfWorkList.forEach((work,index) => {
            const book = document.createElement("div");
            book.classList.add('card','book');
            book.dataset.index = index;
    
            const title = document.createElement('div');
            title.classList.add('title');
            title.textContent = work.title;
            
            const creator = document.createElement('div');
            creator.classList.add('creator');
            creator.textContent = work.creator;
    
            const completeButton = document.createElement('button');
            completeButton.classList.add('mark-completed');
            completeButton.textContent = work.isCompleted ? 'V' : 'X';
            completeButton.addEventListener('click',changePieceState);
    
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete');
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener('click',warnAboutDeletion, {capture: true});
    
            book.append(title,creator,completeButton,deleteButton);
    
            container.append(book);
        })
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
            piecesOfWorkController.deletePieceOfWork(lastClickedDeleteButton.closest('.card').dataset.index);
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

    return {refreshCollection,getPieceOfWorkFormData};
})();

mainController.init();