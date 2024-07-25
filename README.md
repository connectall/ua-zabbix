# ua-zabbix
Zabbix adapter for ConnectALL

ConnectALL Zabbix adapter is built on top of Universal adapter configuration. 

## Usecase
Capture the events from Zabbix and synchronize them to Incident Management systems like servicenow.

## Examples
* Notify if a service is up and running on a server
* Notify if the filesystem/memory is running out of space

## Zabbix setup
### Import Mediatype
Import the [^dist/zabbix-capostrecord-medatype.xml] in to Zabbix server by navigating to Administration -> Media Types and by clicking on Import button

Update the following properties
- ca_base_url => ConnectALL Base URL (http://demo.connectall.com:8090)
- ca_event_applink => Application Link name configured to synchonize the data
- ca_api_key => ConnectALL User API Key for authentication
- zabbix_url => Zabbix Server URI (http://zabbix.connectall.com)

### Map the media to user
Map the newly created zabbix-ca-wrapper to the user who would recieve the notifications by navigating to Administration -> Users -> {Username} -> Media.

### Create Action
Create an Action named "ConnectALL Post Record" by navigating to Configuration -> Actions in Zabbix server and clicking on Create Action button. In the Operations tab choose "Send Message" for Operation type, the user to which the zabbix-ca-wrapper is mapped for "Send to users" and select zabbix-ca-wrapper for "Send only to".

## ConnectALL Setup
* Import adapter descriptor [^ConnectALL_zabbix_descriptor.json] into ConnectALL -> Install universal adapter
* Navigate to `Configuration -> Connections` screen and create a new connection to Zabbix 
* Create an application link in ConnectALL between Zabbix and a destination application of your choice
* Map the fields you want to synchronize 


> As of now this adapter can push the updates from Zabbix to destination systems, but cannot update back or acknowledge the events 


> In order to use the circleci adapter you will need to get the license from ConnectALL sales team. Please reach out to sales@connectall.com for licenses and quotes.
