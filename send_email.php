<?php
// send_email.php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // --- À CONFIGURER ---
    $recipient_email = "contact@sourcinno.com"; // L'adresse où vous recevrez les messages.
    $subject_prefix = "[Contact Sourcinno]";
    // --------------------

    // Nettoyage des données du formulaire pour la sécurité
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = trim($_POST["message"]);

    // Validation simple
    if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Redirige vers une page d'erreur ou affiche un message
        http_response_code(400);
        echo "Merci de remplir chaque champ et fournir une adresse email valide.";
        exit;
    }

    // Construction du contenu de l'email
    $email_content = "Nom: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Message:\n$message\n";

    // Construction des en-têtes de l'email
    $email_subject = "$subject_prefix Nouveau message de $name";
    $email_headers = "From: $name <$email>\r\n";
    $email_headers .= "Reply-To: $email\r\n";
    $email_headers .= "Content-Type: text/plain; charset=utf-8\r\n";

    // Envoi de l'email
    if (mail($recipient_email, $email_subject, $email_content, $email_headers)) {
        // Redirection vers une page de remerciement (à créer si vous le souhaitez)
        // header("Location: /thank-you.html");
        echo "Merci ! Votre message a bien été envoyé.";
    } else {
        http_response_code(500);
        echo "Une erreur s'est produite et votre message n'a pas pu être envoyé.";
    }

} else {
    // N'est pas une requête POST, on interdit l'accès
    http_response_code(403);
    echo "Il y a eu un problème avec votre envoi, merci de réessayer.";
}
?>