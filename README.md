# messager

messager permet de recevoir et envoyer des messages à rabbitMq.

Attention, le format BSON est utilisé pour la communication.

Cela veut dire que les types sont respectés y compris les ObjectID mongoDB. C'est un choix pratique mais impactant: les messages sont binaires donc illisibles à l'oeil nu. L'envoi d'un message texte par la console Rabbit provoquera une erreur bson invalide.

La de/serialisation BSON est faite en dur par la librairie, les utilisateurs peuvent donc directement envoyer et recevoir leurs objects JSON / BSON.

Exemple d'utilisation: voir receiver.js et sender.js dans le dossier test.

Types pris en charge par BSON: https://docs.mongodb.com/manual/reference/bson-types/

