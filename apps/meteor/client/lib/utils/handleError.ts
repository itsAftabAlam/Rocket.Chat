import { escapeHTML } from '@rocket.chat/string-helpers';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { dispatchToastMessage } from '../toast';

const hasXHR = (error: object): error is { xhr: JQuery.jqXHR } => 'xhr' in error;

const hasDetails = (error: object): error is { details: Record<string, string> } =>
	'details' in error && typeof (error as { details: unknown }).details === 'object';

const hasToastrShowed = (error: object): error is { toastrShowed: true } =>
	'toastrShowed' in error && (error as { toastrShowed: unknown }).toastrShowed === true;

const hasError = (error: object): error is { error: string } => 'error' in error && typeof (error as { error: unknown }).error === 'string';

const hasMessage = (error: object): error is { message: string } =>
	'error' in error && typeof (error as { message: unknown }).message === 'string';

const hasErrorTitle = (details: Record<string, string>): details is Record<string, string> & { errorTitle: string } =>
	'errorTitle' in details && typeof (details as Record<string, string> & { errorTitle: unknown }) === 'string';

export const handleError = (error: object, useToastr = true): JQuery<HTMLElement> | string | undefined => {
	if (hasXHR(error) && error.xhr.responseJSON) {
		return handleError(error.xhr.responseJSON, useToastr);
	}

	const message = (hasError(error) && error.error) || (hasMessage(error) && error.message) || undefined;
	const details = hasDetails(error) ? error.details : {};

	if (useToastr) {
		if (hasToastrShowed(error)) {
			return;
		}

		const i18message =
			(hasErrorTitle(details) ? TAPi18n.__(details.errorTitle) : '') +
			TAPi18n.__(message, Object.fromEntries(Object.entries(details).map(([key, value]) => [key, escapeHTML(TAPi18n.__(value))])));

		dispatchToastMessage({
			type: 'error',
			message: i18message,
		});
	}

	return escapeHTML(TAPi18n.__(message, Object.fromEntries(Object.entries(details).map(([key, value]) => [key, TAPi18n.__(value)]))));
};
