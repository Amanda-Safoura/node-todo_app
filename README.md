# Todo App - Node.js  

Une API RESTful pour la gestion de tâches (CRUD) avec authentification basique et notifications par email lors de l’assignation ou réassignation de tâches à une adresse email.  

## Fonctionnalités  
- Authentification (inscription et connexion).  
- CRUD des tâches.  
- Notifications par email (informations sur la tâche).  
- Intégration MySQL avec Sequelize.  

## Prérequis  
- Node.js v16+  
- MySQL configuré  
- Compte Gmail (ou autre SMTP)  

## Installation  
1. Clonez le dépôt et installez les dépendances :  
   ```bash  
   git clone https://github.com/Amanda-Safoura/todo-app-nodejs.git  
   cd todo-app-nodejs  
   npm install  
   ```  

2. Configurez le fichier `.env` avec vos informations MySQL, Gmail et clé privée.  

3. Lancez le serveur :  
   ```bash  
   npm start  
   ```  

L'API est accessible sur : [http://localhost:5000](http://localhost:5000).  

## Points de terminaison  
- **/api/users** : Authentification (register, login).  
- **/api/todos** : Gestion des tâches (CRUD).  

---  
Licence : **MIT**  
