#!/bin/sh

read -p "This Script will restart mysql & nodejs, all current operations will be stopped and need to be restarted. Do you wish to continue? press y to continue or n to cancel. " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    # do dangerous stuff
    cd /data2/acc/axisga-acc #Changing directory to your working directory

pm2 stop all

echo "Stopping pm2"

pm2 start all


echo "ALL NODE INSTANCES HAVE BEEN RESTARTED !!!"
fi

#cd /data2/acc/axisga-acc #Changing directory to your working directory

#pm2 stop all 

#echo "Stopping pm2"

#pm2 start all


#echo "ALL NODE INSTANCES HAVE BEEN RESTARTED !!!"



#### BQ END ####
