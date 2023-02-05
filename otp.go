package main

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type OTP struct {
	Key     string
	Created time.Time
}

type RetentionMap map[string]OTP

func NewRetentionMap(ctx context.Context, retentionPeriod time.Duration) RetentionMap {
	rm := make(RetentionMap)

	return rm
}

func (rm RetentionMap) NewOTP() OTP {
	o := OTP{
		Key:     uuid.NewString(),
		Created: time.Now(),
	}

	rm[o.Key] = 0
	return o
}

func (rm RetentionMap) VerifyOTP(otp string) bool {
	if _, ok := rm[otp]; !ok {
		return false // otp isn't valid
	}
	delete(rm, otp)
	return true
}
