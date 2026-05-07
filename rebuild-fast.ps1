# Script de compilation ultra-rapide sur l'hôte
$MVN = "$PSScriptRoot\tools\apache-maven-3.9.6\bin\mvn.cmd"

echo "--- Compilation de tous les microservices (Vitesse Max Native) ---"
& "$MVN" clean package -DskipTests -B

echo ""
echo "Compilation terminée ! Vous pouvez maintenant lancer Docker :"
echo "docker compose up --build -d"
