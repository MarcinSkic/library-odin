"use strict"
const STORAGE_KEY = "piecesOfWork";
let piecesOfWorkList = [];

function importFromStorage(){
    let importedList = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(importedList === null || importedList === undefined){
        piecesOfWorkList = [];
    } else {
        piecesOfWorkList = importedList;
    }
}

function saveToStorage(){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(piecesOfWorkList));
}

function PieceOfWork(title,creator,isCompleted){
    this.title = title;
    this.creator = creator;
    this.isCompleted = isCompleted;
}

PieceOfWork.prototype.toggleCompletedState = function(){
    this.isCompleted = !this.isCompleted;
}

function addPieceOfWorkToLibrary(event){
    const workType = document.getElementById("type").value;
    let pieceOfWork = null;

    const title = document.getElementById("title").value;
    const creator = document.getElementById('creator').value;
    const isCompleted = document.getElementById('isCompleted').checked;
    switch(workType){
        case "book":
            pieceOfWork = new PieceOfWork(title,creator,isCompleted);
            break;
    }

    piecesOfWorkList.push(pieceOfWork);
    saveToStorage();

    event.preventDefault();
}

function generateLibraryCollection(){
    const container = document.querySelector(".container.books");

    piecesOfWorkList.forEach((work,index) => {
        const book = document.createElement("div");
        book.classList.add('book');
        book.dataset.index = index;

        const title = document.createElement('div');
        title.classList.add('title');
        title.textContent = work.title;
        
        const creator = document.createElement('div');
        creator.classList.add('creator');
        creator.textContent = work.creator;

        const isCompleted = document.createElement('div');
        isCompleted.classList.add('is-completed');
        isCompleted.textContent = work.isCompleted ? 'V' : 'X';

        book.append(title,creator,isCompleted);

        container.append(book);
    })
}
/*<div class="book" data-index="0">
                <div class="title">Mistrz i Małgorzata</div>
                <div class="creator">Michaił Bułhakov</div>
                <div class="is-completed">V</div>
            </div>*/

importFromStorage();
generateLibraryCollection();

document.querySelector("#addNewPieceOfWork").addEventListener('submit',addPieceOfWorkToLibrary);