var EVENT_STATUS = {
    PROBLEM: 'PROBLEM',
    UPDATE: 'UPDATE',
    RESOLVE: 'OK'
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return number in args
                ? args[number]
                : match
                ;
        });
    };
}

function isEventProblem(params) {
    return params.event_value == 1
        && params.event_update_status == 0;
}

function isEventUpdate(params) {
    return params.event_value == 1
        && params.event_update_status == 1;
}

function isEventResolve(params) {
    return params.event_value == 0;
}

function createProblemURL(zabbixURL, triggerId, eventId) {
    var problemURL = '{0}/tr_events.php?triggerid={1}&eventid={2}'
        .format(
            zabbixURL.replace(/\/+$/, ''),
            triggerId,
            eventId
        );

    return problemURL
}

function getTagValue(eventTags, key) {
    var pattern = new RegExp('(' + key + ':.+)');
    var tagValue = eventTags
        .split(',')
        .filter(function (v) { return v.match(pattern) })
        .map(function (v) { return v.split(':')[1] })[0]
        || 0;

    return tagValue;
}

function notifyConnectALL(params) {
    reqBody = {
        appLinkName: params.ca_event_applink
    }

    var status = EVENT_STATUS.PROBLEM;
    var eventDate = params.event_date;
    var eventTime = params.event_time;
    var message = params.event_opdata;

    if (isEventUpdate(params)) {
        status = EVENT_STATUS.UPDATE;
        message = params.event_update_message;
    } else if (isEventResolve(params)) {
        status = EVENT_STATUS.RESOLVE;
        message = params.event_update_message;
    }

    reqBody.fields = createMessage(
        status,
        eventDate,
        eventTime,
        message,
        createProblemURL(params.zabbix_url, params.trigger_id, params.event_id)
    ); 

    Zabbix.Log(3, 'ConnectALL PostRecord Request : ' + JSON.stringify(reqBody));
    var resp = JSON.parse(req.Post(ConnectAll.postMessage, JSON.stringify(reqBody)));
    Zabbix.Log(3, 'ConnectALL PostRecord Response  : ' + JSON.stringify(resp));
    if (resp.Response != "Success") {
        throw resp.Message;
    }
}

function createMessage(
    status,
    event_date,
    event_time,
    message,
    problemURL
) {

    var message = {
        'id' : params.event_id,
        'name': params.event_name,
        'status': status,
        'description': message,
        'severity': params.event_severity,
        'triggerDescription': params.trigger_description,
        'triggerid': params.trigger_id,
        'host': '{0} [{1}]'.format(params.host_name, params.host_ip),
        'updateDt': new Date(),
        'eventLink': problemURL,
        'eventDt': '{0} {1}'.format(event_date, event_time)
    }
    return message;
}

try {
    var params = JSON.parse(value),
        req = new CurlHttpRequest(),
        reqBody = {},
        result = {};

    req.AddHeader('Content-Type: application/json; charset=utf-8');

    var ConnectAll = {
        postMessage: params.ca_base_url + '/connectall/api/2/postRecord?apikey='+params.ca_api_key,
    }

    notifyConnectALL(params);
    return JSON.stringify(result);

} catch (error) {
    Zabbix.Log(3, 'ConnectALL push failed : ' + error);
    throw 'ConnectALL push failed : ' + error;
}