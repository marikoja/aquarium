# frozen_string_literal: true

# typed: false

class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
end
