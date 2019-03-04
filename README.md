# messager

messager permet de recevoir et envoyer des messages à rabbitMq.

Attention, le format BSON est utilisé pour la communication.

Cela veut dire que les types sont respectés y compris les ObjectID mongoDB. C'est un choix pratique mais impactant: les messages sont binaires donc illisibles directement.

Exemple d'utilisation voir receiver.js et sender.js dans le dossier test.

