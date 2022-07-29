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
    console.log("?");
    piecesOfWorkList = piecesOfWorkList.map(object => Object.assign(new PieceOfWork(),object));
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
            console.log(pieceOfWork);
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
        book.classList.add('card','book');
        book.dataset.index = index;

        const title = document.createElement('div');
        title.classList.add('title');
        title.textContent = work.title;
        
        const creator = document.createElement('div');
        creator.classList.add('creator');
        creator.textContent = work.creator;

        const completeButton = document.createElement('button');
        completeButton.classList.add('is-completed');
        completeButton.textContent = work.isCompleted ? 'V' : 'X';
        completeButton.addEventListener('click',changePieceState);

        book.append(title,creator,completeButton);

        container.append(book);
    })
}

function changePieceState(event){
    let index = event.target.closest('.card').dataset.index;
    piecesOfWorkList[index].toggleCompletedState();

    event.target.textContent = piecesOfWorkList[index].isCompleted ? 'V' : 'X';

    saveToStorage();
}

importFromStorage();
generateLibraryCollection();

document.querySelector("#addNewPieceOfWork").addEventListener('submit',addPieceOfWorkToLibrary);